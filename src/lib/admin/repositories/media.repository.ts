import type { SupabaseClient } from "@supabase/supabase-js";
import type { RepoResult } from "../types";

// ── Domain Types ─────────────────────────────────────────────────────────────

export type MediaFile = {
  id: string;
  filename: string;
  originalFilename: string;
  title: string | null;
  storagePath: string;
  publicUrl: string;
  thumbnailUrl: string | null;
  mimeType: string;
  extension: string;
  width: number | null;
  height: number | null;
  sizeBytes: number;
  altText: string | null;
  caption: string | null;
  dominantColor: string | null;
  blurHash: string | null;
  checksum: string | null;
  isOptimized: boolean;
  folderId: string | null;
  uploadedBy: string;
  createdAt: string;
  deletedAt: string | null;
};

export type MediaFolder = {
  id: string;
  name: string;
  parentFolderId: string | null;
  createdAt: string;
};

export type MediaUsage = {
  id: string;
  mediaId: string;
  entityType: string;
  entityId: string;
  fieldName: string;
  createdAt: string;
};

// ── Params ───────────────────────────────────────────────────────────────────

export type CreateMediaParams = {
  filename: string;
  originalFilename: string;
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  checksum?: string | null;
  folderId?: string | null;
  uploadedBy: string;
};

export type UpdateMediaParams = {
  title?: string | null;
  altText?: string | null;
  caption?: string | null;
  folderId?: string | null;
};

export type ListMediaParams = {
  page?: number;
  perPage?: number;
  folderId?: string | null;
  search?: string;
  mimeTypePrefix?: string;
};

export type PaginatedMedia = {
  files: MediaFile[];
  total: number;
  page: number;
  perPage: number;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function rowToMediaFile(row: Record<string, unknown>): MediaFile {
  return {
    id: row.id as string,
    filename: row.filename as string,
    originalFilename: row.original_filename as string,
    title: (row.title as string) ?? null,
    storagePath: row.storage_path as string,
    publicUrl: row.public_url as string,
    thumbnailUrl: (row.thumbnail_url as string) ?? null,
    mimeType: row.mime_type as string,
    extension: row.extension as string,
    width: (row.width as number) ?? null,
    height: (row.height as number) ?? null,
    sizeBytes: row.size_bytes as number,
    altText: (row.alt_text as string) ?? null,
    caption: (row.caption as string) ?? null,
    dominantColor: (row.dominant_color as string) ?? null,
    blurHash: (row.blur_hash as string) ?? null,
    checksum: (row.checksum as string) ?? null,
    isOptimized: row.is_optimized as boolean,
    folderId: (row.folder_id as string) ?? null,
    uploadedBy: row.uploaded_by as string,
    createdAt: row.created_at as string,
    deletedAt: (row.deleted_at as string) ?? null,
  };
}

// ── Repository Functions ─────────────────────────────────────────────────────

export async function createMedia(
  supabase: SupabaseClient,
  params: CreateMediaParams
): Promise<RepoResult<MediaFile>> {
  const { data, error } = await supabase
    .from("media")
    .insert({
      filename: params.filename,
      original_filename: params.originalFilename,
      storage_path: params.storagePath,
      public_url: params.publicUrl,
      mime_type: params.mimeType,
      extension: params.extension,
      size_bytes: params.sizeBytes,
      width: params.width ?? null,
      height: params.height ?? null,
      checksum: params.checksum ?? null,
      folder_id: params.folderId ?? null,
      uploaded_by: params.uploadedBy,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to create media record" };
  }

  return { success: true, data: rowToMediaFile(data) };
}

export async function getMediaById(
  supabase: SupabaseClient,
  id: string
): Promise<RepoResult<MediaFile>> {
  const { data, error } = await supabase
    .from("media")
    .select()
    .eq("id", id)
    .single();

  if (error || !data) {
    return { success: false, error: "Media not found" };
  }

  return { success: true, data: rowToMediaFile(data) };
}

export async function listMedia(
  supabase: SupabaseClient,
  params: ListMediaParams = {}
): Promise<RepoResult<PaginatedMedia>> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 24;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("media")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (params.folderId !== undefined) {
    if (params.folderId === null) {
      query = query.is("folder_id", null);
    } else {
      query = query.eq("folder_id", params.folderId);
    }
  }

  if (params.search) {
    query = query.or(
      `original_filename.ilike.%${params.search}%,alt_text.ilike.%${params.search}%`
    );
  }

  if (params.mimeTypePrefix) {
    query = query.like("mime_type", `${params.mimeTypePrefix}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      files: (data ?? []).map(rowToMediaFile),
      total: count ?? 0,
      page,
      perPage,
    },
  };
}

export async function updateMedia(
  supabase: SupabaseClient,
  id: string,
  params: UpdateMediaParams
): Promise<RepoResult<MediaFile>> {
  const updates: Record<string, unknown> = {};

  if (params.title !== undefined) updates.title = params.title;
  if (params.altText !== undefined) updates.alt_text = params.altText;
  if (params.caption !== undefined) updates.caption = params.caption;
  if (params.folderId !== undefined) updates.folder_id = params.folderId;

  if (Object.keys(updates).length === 0) {
    return getMediaById(supabase, id);
  }

  const { data, error } = await supabase
    .from("media")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to update media" };
  }

  return { success: true, data: rowToMediaFile(data) };
}

export async function deleteMedia(
  supabase: SupabaseClient,
  id: string
): Promise<RepoResult<null>> {
  // Check usage before deletion
  const { count } = await supabase
    .from("media_usage")
    .select("id", { count: "exact", head: true })
    .eq("media_id", id);

  if (count && count > 0) {
    return {
      success: false,
      error: `Cannot delete: this file is used in ${count} place(s). Remove references first.`,
    };
  }

  // Soft delete (recoverable)
  const { error } = await supabase
    .from("media")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: null };
}

export async function permanentlyDeleteMedia(
  supabase: SupabaseClient,
  id: string
): Promise<RepoResult<null>> {
  // Get storage path for cleanup
  const { data: mediaData } = await supabase
    .from("media")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (mediaData?.storage_path) {
    await supabase.storage.from("media").remove([mediaData.storage_path]);
  }

  const { error } = await supabase.from("media").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: null };
}

export async function restoreMedia(
  supabase: SupabaseClient,
  id: string
): Promise<RepoResult<MediaFile>> {
  const { data, error } = await supabase
    .from("media")
    .update({ deleted_at: null })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to restore" };
  }

  return { success: true, data: rowToMediaFile(data) };
}

export async function findByChecksum(
  supabase: SupabaseClient,
  checksum: string
): Promise<RepoResult<MediaFile | null>> {
  const { data, error } = await supabase
    .from("media")
    .select()
    .eq("checksum", checksum)
    .limit(1)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: data ? rowToMediaFile(data) : null,
  };
}

// ── Folder Operations ────────────────────────────────────────────────────────

export async function createFolder(
  supabase: SupabaseClient,
  name: string,
  parentFolderId?: string | null
): Promise<RepoResult<MediaFolder>> {
  const { data, error } = await supabase
    .from("media_folders")
    .insert({
      name,
      parent_folder_id: parentFolderId ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to create folder" };
  }

  return {
    success: true,
    data: {
      id: data.id,
      name: data.name,
      parentFolderId: data.parent_folder_id,
      createdAt: data.created_at,
    },
  };
}

export async function listFolders(
  supabase: SupabaseClient,
  parentFolderId?: string | null
): Promise<RepoResult<MediaFolder[]>> {
  let query = supabase
    .from("media_folders")
    .select()
    .order("name", { ascending: true });

  if (parentFolderId === null || parentFolderId === undefined) {
    query = query.is("parent_folder_id", null);
  } else {
    query = query.eq("parent_folder_id", parentFolderId);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      parentFolderId: row.parent_folder_id,
      createdAt: row.created_at,
    })),
  };
}

// ── Usage Tracking ───────────────────────────────────────────────────────────

export async function trackUsage(
  supabase: SupabaseClient,
  mediaId: string,
  entityType: string,
  entityId: string,
  fieldName: string
): Promise<RepoResult<null>> {
  const { error } = await supabase.from("media_usage").upsert(
    {
      media_id: mediaId,
      entity_type: entityType,
      entity_id: entityId,
      field_name: fieldName,
    },
    { onConflict: "media_id,entity_type,entity_id,field_name", ignoreDuplicates: true }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: null };
}

export async function removeUsage(
  supabase: SupabaseClient,
  mediaId: string,
  entityType: string,
  entityId: string
): Promise<RepoResult<null>> {
  const { error } = await supabase
    .from("media_usage")
    .delete()
    .eq("media_id", mediaId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: null };
}
