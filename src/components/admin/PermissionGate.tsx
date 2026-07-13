"use client";

import type { ReactNode } from "react";
import type { RoleName } from "@/lib/admin/types";
import { hasAnyRole } from "@/lib/admin/types";

type PermissionGateProps = {
  userRoles: RoleName[];
  requiredRoles: RoleName[];
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Conditionally renders children based on user roles.
 * UI-level permission enforcement (defense layer 2 of 4).
 */
export function PermissionGate({
  userRoles,
  requiredRoles,
  children,
  fallback = null,
}: PermissionGateProps) {
  if (!hasAnyRole(userRoles, requiredRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
