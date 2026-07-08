import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AuditAction,
  AuditEntityType,
  AuditLogEntry,
  RepoResult,
} from "../types";

/**
 * Audit repository — logs admin actions and queries activity timeline.
 * Uses service role client.
 */

export type CreateAuditLogParams = {
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function createAuditLog(
  supabase: SupabaseClient,
  params: CreateAuditLogParams
): Promise<RepoResult<AuditLogEntry>> {
  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      user_id: params.userId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      old_value: params.oldValue ?? null,
      new_value: params.newValue ?? null,
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to create audit log" };
  }

  return {
    success: true,
    data: {
      id: data.id,
      userId: data.user_id,
      action: data.action as AuditAction,
      entityType: data.entity_type as AuditEntityType,
      entityId: data.entity_id,
      oldValue: data.old_value,
      newValue: data.new_value,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      createdAt: data.created_at,
    },
  };
}

export type ListAuditLogsParams = {
  page?: number;
  perPage?: number;
  userId?: string;
  entityType?: AuditEntityType;
  action?: AuditAction;
};

export type PaginatedAuditLogs = {
  entries: AuditLogEntry[];
  total: number;
  page: number;
  perPage: number;
};

export async function listAuditLogs(
  supabase: SupabaseClient,
  params: ListAuditLogsParams = {}
): Promise<RepoResult<PaginatedAuditLogs>> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 25;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (params.userId) {
    query = query.eq("user_id", params.userId);
  }

  if (params.entityType) {
    query = query.eq("entity_type", params.entityType);
  }

  if (params.action) {
    query = query.eq("action", params.action);
  }

  const { data, error, count } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  const entries: AuditLogEntry[] = (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    action: row.action as AuditAction,
    entityType: row.entity_type as AuditEntityType,
    entityId: row.entity_id,
    oldValue: row.old_value,
    newValue: row.new_value,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: row.created_at,
  }));

  return {
    success: true,
    data: {
      entries,
      total: count ?? 0,
      page,
      perPage,
    },
  };
}
