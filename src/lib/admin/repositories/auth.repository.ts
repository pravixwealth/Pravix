import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminUser, RepoResult, RoleName, UserRole } from "../types";

/**
 * Auth repository — handles role queries and admin user resolution.
 * Uses service role client for cross-user access.
 */

export async function resolveAdminUser(
  supabase: SupabaseClient,
  userId: string
): Promise<RepoResult<AdminUser>> {
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

  if (userError || !userData?.user) {
    return { success: false, error: "User not found" };
  }

  const { data: roleRows, error: rolesError } = await supabase
    .from("user_roles")
    .select("id, role_id, assigned_by, assigned_at, roles(name)")
    .eq("user_id", userId);

  if (rolesError) {
    return { success: false, error: rolesError.message };
  }

  const roles: RoleName[] = (roleRows ?? [])
    .map((row: Record<string, unknown>) => {
      const rolesRelation = row.roles as { name: string } | null;
      return rolesRelation?.name as RoleName | undefined;
    })
    .filter((name): name is RoleName => Boolean(name));

  if (roles.length === 0) {
    return { success: false, error: "User has no admin roles" };
  }

  return {
    success: true,
    data: {
      id: userId,
      email: userData.user.email ?? "",
      roles,
    },
  };
}

export async function getUserRoles(
  supabase: SupabaseClient,
  userId: string
): Promise<RepoResult<UserRole[]>> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("id, user_id, role_id, assigned_by, assigned_at, roles(name)")
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  const roles: UserRole[] = (data ?? []).map((row: Record<string, unknown>) => {
    const rolesRelation = row.roles as { name: string } | null;
    return {
      id: row.id as string,
      userId: row.user_id as string,
      roleId: row.role_id as string,
      roleName: (rolesRelation?.name ?? "viewer") as RoleName,
      assignedBy: row.assigned_by as string | null,
      assignedAt: row.assigned_at as string,
    };
  });

  return { success: true, data: roles };
}

export async function assignRole(
  supabase: SupabaseClient,
  userId: string,
  roleName: RoleName,
  assignedBy: string
): Promise<RepoResult<UserRole>> {
  // Get role ID from name
  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", roleName)
    .single();

  if (roleError || !roleData) {
    return { success: false, error: `Role '${roleName}' not found` };
  }

  const { data, error } = await supabase
    .from("user_roles")
    .upsert(
      {
        user_id: userId,
        role_id: roleData.id,
        assigned_by: assignedBy,
        assigned_at: new Date().toISOString(),
      },
      { onConflict: "user_id,role_id" }
    )
    .select("id, user_id, role_id, assigned_by, assigned_at")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to assign role" };
  }

  return {
    success: true,
    data: {
      id: data.id,
      userId: data.user_id,
      roleId: data.role_id,
      roleName,
      assignedBy: data.assigned_by,
      assignedAt: data.assigned_at,
    },
  };
}

export async function revokeRole(
  supabase: SupabaseClient,
  userId: string,
  roleName: RoleName
): Promise<RepoResult<null>> {
  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", roleName)
    .single();

  if (roleError || !roleData) {
    return { success: false, error: `Role '${roleName}' not found` };
  }

  const { error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role_id", roleData.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: null };
}
