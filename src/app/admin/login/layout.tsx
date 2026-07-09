/**
 * Admin login page has its own layout — no sidebar, no auth guard.
 * This overrides the parent admin layout for the /admin/login route only.
 */
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
