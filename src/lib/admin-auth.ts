// Admin email — set ADMIN_EMAIL in .env.local
// Falls back to a placeholder so the UI is always accessible in dev
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@example.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export { ADMIN_EMAIL };
