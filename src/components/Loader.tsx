/**
 * Tiny centred spinner (+ optional line of text). Inline styles on purpose:
 * it must look right even before the stylesheet has loaded.
 */
export function Loader({ label = 'Loading', text }: { label?: string; text?: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', alignContent: 'center', gap: 14 }}
    >
      <style>{'@keyframes repup-spin{to{transform:rotate(360deg)}}'}</style>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '3px solid rgba(124, 58, 237, 0.2)',
          borderTopColor: '#7c3aed',
          animation: 'repup-spin 0.75s linear infinite',
        }}
      />
      {text && <span style={{ fontSize: 13, opacity: 0.6, fontFamily: 'system-ui, sans-serif' }}>{text}</span>}
    </div>
  );
}
