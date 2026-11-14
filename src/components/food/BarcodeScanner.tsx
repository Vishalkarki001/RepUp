'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Flashlight, FlashlightOff, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isProductCode } from '@/lib/food/off';
import { cn } from '@/lib/utils';

type Source = HTMLVideoElement | HTMLCanvasElement | ImageBitmap;
type Detector = { detect(src: Source): Promise<{ rawValue: string }[]> };
const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

/**
 * The phone's own barcode reader when it has one (Chrome on Android), else
 * ZXing in WebAssembly (iPhone Safari, Firefox). The .wasm file is served by
 * RepUp itself: public/zxing_reader.wasm, copied from node_modules/zxing-wasm
 * (a test checks the two match after an update).
 */
let detectorPromise: Promise<Detector> | null = null;
function getDetector(): Promise<Detector> {
  return (detectorPromise ??= (async () => {
    const Native = (globalThis as { BarcodeDetector?: { new (o: { formats: string[] }): Detector; getSupportedFormats(): Promise<string[]> } })
      .BarcodeDetector;
    if (Native) {
      try {
        const supported = await Native.getSupportedFormats();
        const formats = FORMATS.filter((f) => supported.includes(f));
        if (formats.length) return new Native({ formats });
      } catch {
        /* fall back to ZXing */
      }
    }
    const m = await import('barcode-detector/ponyfill');
    m.prepareZXingModule({
      overrides: { locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? '/zxing_reader.wasm' : prefix + path) },
    });
    return new m.BarcodeDetector({ formats: FORMATS as never }) as unknown as Detector;
  })().catch((e) => {
    detectorPromise = null;
    throw e;
  }));
}

/** Camera features some phones have (Chrome on Android): continuous focus, zoom, torch. */
type Caps = MediaTrackCapabilities & { focusMode?: string[]; zoom?: { min: number; max: number }; torch?: boolean };

/**
 * Camera view that calls onCode once with the first product barcode it reads.
 * Asks for an HD camera (small barcodes need pixels), turns on continuous focus
 * and a little zoom where the phone allows (so it can be held further away,
 * where phone cameras focus), a torch button, and a "take a photo" fallback
 * that uses the phone's own camera app (best focus, works everywhere).
 * The numbers under the barcode can be typed too.
 */
export function BarcodeScanner({ onCode, busy }: { onCode: (code: string) => void; busy?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const photo = useRef<HTMLInputElement>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const doneRef = useRef(false);
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;
  const [status, setStatus] = useState<'starting' | 'scanning' | 'denied' | 'unavailable'>('starting');
  const [torch, setTorch] = useState<boolean | null>(null); // null = this camera has no torch
  const [typed, setTyped] = useState('');
  const [reading, setReading] = useState(false);

  const finish = (code: string) => {
    if (doneRef.current) return;
    doneRef.current = true;
    navigator.vibrate?.(60);
    trackRef.current?.stop();
    onCodeRef.current(code);
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setStatus('unavailable');
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
      } catch (e) {
        return setStatus((e as Error).name === 'NotAllowedError' ? 'denied' : 'unavailable');
      }
      const v = video.current;
      if (stopped || !v) return stream.getTracks().forEach((t) => t.stop());
      const track = stream.getVideoTracks()[0];
      trackRef.current = track;
      try {
        const caps = (track.getCapabilities?.() ?? {}) as Caps;
        const advanced: Record<string, unknown>[] = [];
        if (caps.focusMode?.includes('continuous')) advanced.push({ focusMode: 'continuous' });
        if (caps.zoom && caps.zoom.max >= 1.5) advanced.push({ zoom: Math.min(2, caps.zoom.max) });
        if (advanced.length) await track.applyConstraints({ advanced } as MediaTrackConstraints).catch(() => {});
        if (caps.torch) setTorch(false);
      } catch {
        /* camera without these features */
      }
      v.srcObject = stream;
      await v.play().catch(() => {});
      let detector: Detector;
      try {
        detector = await getDetector();
      } catch {
        return setStatus('unavailable');
      }
      if (stopped) return;
      setStatus('scanning');
      // Read the middle of the picture (where the frame is): faster, and fewer pixels to get wrong.
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const tick = async () => {
        if (stopped || doneRef.current) return;
        try {
          if (v.readyState >= 2 && v.videoWidth) {
            const w = Math.round(v.videoWidth * 0.9);
            const h = Math.round(v.videoHeight * 0.6);
            canvas.width = w;
            canvas.height = h;
            ctx?.drawImage(v, (v.videoWidth - w) / 2, (v.videoHeight - h) / 2, w, h, 0, 0, w, h);
            const hit = (await detector.detect(ctx ? canvas : v)).find((c) => isProductCode(c.rawValue));
            if (hit && !stopped) return finish(hit.rawValue);
          }
        } catch {
          /* a frame that couldn't be read: try the next one */
        }
        timer = setTimeout(tick, 150);
      };
      void tick();
    })();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleTorch = async () => {
    const track = trackRef.current;
    if (!track || torch === null) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch }] } as unknown as MediaTrackConstraints);
      setTorch(!torch);
    } catch {
      setTorch(null);
    }
  };

  /** A photo from the phone's camera app: sharp and focused, then read like a video frame. */
  const readPhoto = async (file: File | undefined) => {
    if (!file) return;
    setReading(true);
    try {
      const [detector, bitmap] = await Promise.all([getDetector(), createImageBitmap(file)]);
      const hit = (await detector.detect(bitmap)).find((c) => isProductCode(c.rawValue));
      bitmap.close?.();
      if (hit) finish(hit.rawValue);
      else toast.error('Couldn’t read a barcode in that photo. Fill the photo with the barcode, keep it sharp, or type the numbers.');
    } catch {
      toast.error('Couldn’t read that photo. Try again or type the numbers.');
    } finally {
      setReading(false);
      if (photo.current) photo.current.value = '';
    }
  };

  const typedOk = isProductCode(typed);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black">
        <video ref={video} playsInline muted autoPlay className="size-full object-cover" />
        {status === 'scanning' && (
          <>
            <div className="pointer-events-none absolute inset-x-[8%] top-1/2 h-[45%] -translate-y-1/2 rounded-lg border-2 border-white/85 shadow-[0_0_0_9999px_rgb(0_0_0/0.35)]" />
            <div className="pointer-events-none absolute inset-x-[12%] top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-red-500/80" />
            {torch !== null && (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={() => void toggleTorch()}
                aria-label={torch ? 'Torch off' : 'Torch on'}
              >
                {torch ? <FlashlightOff /> : <Flashlight />}
              </Button>
            )}
          </>
        )}
        {status !== 'scanning' && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-white/85">
            {status === 'starting' ? (
              'Starting camera…'
            ) : (
              <div className="flex flex-col items-center gap-2">
                <CameraOff className="size-6" />
                {status === 'denied'
                  ? 'Camera is blocked for RepUp. Allow the camera in your browser or phone settings, or use a photo or the numbers below.'
                  : 'Can’t open the camera here. Take a photo instead, or type the numbers under the barcode.'}
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {busy ? 'Looking it up…' : 'Put the barcode inside the box, about a hand’s length (15–20 cm) away, in good light. Hold still.'}
      </p>

      <input ref={photo} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => void readPhoto(e.target.files?.[0])} />
      <Button type="button" variant="outline" className="h-10" disabled={reading || busy} onClick={() => photo.current?.click()}>
        <Camera /> {reading ? 'Reading photo…' : 'Not scanning? Take a photo of the barcode'}
      </Button>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (typedOk) finish(typed);
        }}
      >
        <Input
          inputMode="numeric"
          autoComplete="off"
          placeholder="Or type the numbers under the barcode"
          aria-label="Barcode numbers"
          value={typed}
          onChange={(e) => setTyped(e.target.value.replace(/\D/g, '').slice(0, 14))}
          className="h-10 tabular"
        />
        <Button type="submit" variant="outline" className={cn('h-10', typedOk && 'border-primary text-brand')} disabled={!typedOk || busy}>
          <Search /> Find
        </Button>
      </form>
      {typed.length > 0 && !typedOk && <p className="-mt-2 text-xs text-muted-foreground">Barcodes are 8 to 14 digits ({typed.length} so far).</p>}
    </div>
  );
}
