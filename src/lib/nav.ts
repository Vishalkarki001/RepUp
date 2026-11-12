/**
 * Tiny app-wide navigation signal: lets menus outside the main screen (the
 * account menu) ask the app shell to open a screen.
 */
const OPEN_ADMIN = 'repup:open-admin';

export function openAdminDashboard() {
  window.dispatchEvent(new Event(OPEN_ADMIN));
}

export function onOpenAdminDashboard(fn: () => void): () => void {
  window.addEventListener(OPEN_ADMIN, fn);
  return () => window.removeEventListener(OPEN_ADMIN, fn);
}
