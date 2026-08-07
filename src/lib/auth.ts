// Admin authentication helper
// Credentials stored here — change as needed
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'kopana2026';
const SESSION_KEY = 'kopana_admin_session';

export function loginAdmin(username: string, password: string): boolean {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, 'authenticated');
    return true;
  }
  return false;
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SESSION_KEY) === 'authenticated';
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
