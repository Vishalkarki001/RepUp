'use client';

import { useEffect, useRef, useState } from 'react';
import { CameraOff, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Detector = { detect(src: HTMLVideoElement): Promise<{ rawValue: string }[]> };
const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

/**
 * The phone's own barcode reader when it has one (Chrome on Android), else
 * ZXing in WebAssembly (iPhone Safari, Firefox). The .wasm file is served by
 * RepUp itself: public/zxing_reader.wasm, copied from node_modules/zxing-wasm
 * (a test checks the two match after an update).
 */
async function makeDetector(): Promise<Detector> {
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
  return new m.BarcodeDetector({ formats: FORMATS as never });
}

/** Camera view that calls onCode once with the first barcode it reads. Numbers can be typed too. */
export function BarcodeScanner({ onCode, busy }: { onCode: (code: string) => void; busy?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;
  const [status, setStatus] = useState<'starting' | 'scanning' | 'denied' | 'unavailable'>('starting');
  const [typed, setTyped] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setStatus('unavailable');
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      } catch (e) {
        return setStatus((e as Error).name === 'NotAllowedError' ? 'denied' : 'unavailable');
      }
      const v = video.current;
      if (stopped || !v) return stream.getTracks().forEach((t) => t.stop());
      v.srcObject = stream;
      await v.play().catch(() => {});
      let detector: Detector;
      try {
        detector = await makeDetector();
      } catch {
        return setStatus('unavailable');
      }
      if (stopped) return;
      setStatus('scanning');
      const tick = async () => {
        if (stopped) return;
        try {
          if (v.readyState >= 2) {
            const hit = (await detector.detect(v)).find((c) => /^\d{8,14}$/.test(c.rawValue));
            if (hit && !stopped) {
              navigator.vibrate?.(60);
              stopped = true;
              stream?.getTracks().forEach((t) => t.stop());
              onCodeRef.current(hit.rawValue);
              return;
            }
          }
        } catch {
          /* a frame that couldn't be read: try the next one */
        }
        timer = setTimeout(tick, 200);
      };
      void tick();
    })();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const typedOk = /^\d{8,14}$/.test(typed);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black">
        <video ref={video} playsInline muted className="size-full object-cover" />
        {status === 'scanning' && (
          <div className="pointer-events-none absolute inset-x-[12%] top-1/2 h-24 -translate-y-1/2 rounded-lg border-2 border-white/80 shadow-[0_0_0_9999px_rgb(0_0_0/0.35)]" />
        )}
        {status !== 'scanning' && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-white/85">
            {status === 'starting' ? (
              'Starting camera…'
            ) : (
              <div className="flex flex-col items-center gap-2">
                <CameraOff className="size-6" />
                {status === 'denied'
                  ? 'Camera is blocked for RepUp. Allow the camera in your browser or phone settings, or type the numbers below.'
                  : 'Can’t open the camera here. Type the numbers under the barcode instead.'}
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {busy ? 'Looking it up…' : 'Point the camera at the barcode on the pack. Hold still for a second.'}
      </p>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (typedOk) onCodeRef.current(typed);
        }}
      >
        <Input
          inputMode="numeric"
          autoComplete="off"
          placeholder="Or type the barcode numbers"
          aria-label="Barcode numbers"
          value={typed}
          onChange={(e) => setTyped(e.target.value.replace(/\D/g, '').slice(0, 14))}
          className="h-10"
        />
        <Button type="submit" variant="outline" className="h-10" disabled={!typedOk || busy}>
          <Search /> Find
        </Button>
      </form>
    </div>
  );
}
