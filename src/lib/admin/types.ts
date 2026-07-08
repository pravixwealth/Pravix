/**
 * Core admin platform types.
 * These types are shared across all admin modules.
 */

// ── Result Types (domain objects, never Supabase responses) ──────────────────

export type RepoSuccess<T> = {
  success: true;
  data: T;
};

export type RepoError = {
  success: false;
  error: string;
};

export type RepoResult<T> = RepoSuccess<T> | RepoError;

// ── Role & Permission Types ─────────────────────────────────────────────────

export type RoleName = "super_admin" | "admin" | "editor" | "viewer";

export type Role = {
  id: string;
  name: RoleName;
  description: string;
  createdAt: string;
};

export type UserRole = {
  id: string;
  userId: string;
  roleId: string;
  roleName: RoleName;
  assignedBy: string | null;
  assignedAt: string;
};

// ── Audit Types ─────────────────────────────────────────────────────────────

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "login"
  | "role_change"
  | "restore"
  | "upload"
  | "status_change";

export type AuditEntityType =
  | "blog_post"
  | "blog_category"
  | "blog_tag"
  | "blog_author"
  | "media"
  | "system_setting"
  | "site_content"
  | "navigation_menu"
  | "navigation_item"
  | "user"
  | "role";

export type AuditLogEntry = {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

// ── Admin User Context ──────────────────────────────────────────────────────

export type AdminUser = {
  id: string;
  email: string;
  roles: RoleName[];
};

// ── Permission Helpers ──────────────────────────────────────────────────────

export const ROLE_HIERARCHY: Record<RoleName, number> = {
  super_admin: 100,
  admin: 80,
  editor: 40,
  viewer: 10,
};

export function hasRole(userRoles: RoleName[], required: RoleName): boolean {
  return userRoles.some(
    (role) => ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[required]
  );
}

export function hasAnyRole(userRoles: RoleName[], required: RoleName[]): boolean {
  return required.some((role) => hasRole(userRoles, role));
}
