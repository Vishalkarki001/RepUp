/**
 * Start-up screen: the RepUp icon with the name under it, and a small spinner.
 * It follows the phone's own splash screen (icon only), so the app name shows
 * while the workouts load. Inline styles on purpose: it must look right even
 * before the stylesheet has loaded.
 */
export function Loader({ label = 'Loading', text }: { label?: string; text?: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        fontFamily: 'var(--font-sans), system-ui, sans-serif',
      }}
    >
      <style>{'@keyframes repup-spin{to{transform:rotate(360deg)}}@keyframes repup-in{from{opacity:0;transform:scale(.94)}}'}</style>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icon-192.png?v=3"
        alt=""
        width={88}
        height={88}
        style={{ width: 88, height: 88, animation: 'repup-in .35s ease-out both' }}
      />
      <span
        style={{
          fontSize: 30,
          fontWeight: 800,
          fontStyle: 'italic',
          letterSpacing: '-0.03em',
          lineHeight: 1,
          animation: 'repup-in .35s ease-out both',
        }}
      >
        Rep
        <span
          style={{
            background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            paddingRight: 3,
          }}
        >
          Up
        </span>
      </span>
      <span
        style={{
          marginTop: 18,
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: '2.5px solid rgba(124, 58, 237, 0.2)',
          borderTopColor: '#7c3aed',
          animation: 'repup-spin 0.75s linear infinite',
        }}
      />
      {text && <span style={{ fontSize: 13, opacity: 0.6 }}>{text}</span>}
    </div>
  );
}
