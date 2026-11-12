/**
 * Tiny centred spinner. Inline styles on purpose: it must look right even
 * before the stylesheet has loaded.
 */
export function Loader({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" aria-label={label} style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
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
    </div>
  );
}
