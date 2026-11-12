import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const alt = 'RepUp: free gym workout tracker. Log sets, reps and kg, then beat last time.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** The picture shown when a RepUp link is shared on WhatsApp, X, LinkedIn… */
export default async function Image() {
  const icon = await readFile(join(process.cwd(), 'public/icon-512.png'));
  const src = `data:image/png;base64,${icon.toString('base64')}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 64,
          padding: '0 96px',
          background: 'linear-gradient(135deg, #0b0a1f 0%, #1e1b4b 55%, #4c1d95 100%)',
          color: 'white',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={300} height={300} alt="" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', fontSize: 104, fontWeight: 800, fontStyle: 'italic', letterSpacing: -4 }}>
            Rep<span style={{ color: '#a78bfa' }}>Up</span>
          </div>
          <div style={{ fontSize: 44, fontWeight: 600, lineHeight: 1.2, maxWidth: 640 }}>Log sets, reps & kg. See last time. Beat it.</div>
          <div style={{ fontSize: 30, color: '#c4b5fd' }}>Free gym workout tracker · works offline</div>
        </div>
      </div>
    ),
    size,
  );
}
