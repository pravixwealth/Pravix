import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * ConfigurationService — centralized access to all platform settings.
 *
 * Features:
 * - Server-side TTL cache (avoids repeated DB reads)
 * - Single API for frontend components to read config
 * - Separates business settings from system settings
 * - Cache invalidation on admin updates
 *
 * Usage in Server Components:
 *   import { config } from "@/lib/admin/configuration.service";
 *   const companyName = await config.get("company_name");
 *   const allContact = await config.getGroup("contact");
 */

// ── Cache ────────────────────────────────────────────────────────────────────

type CacheEntry = {
  value: string | null;
  expiresAt: number;
};

type GroupCacheEntry = {
  values: Record<string, string | null>;
  expiresAt: number;
};

const CACHE_TTL_MS = 60_000; // 1 minute
const settingsCache = new Map<string, CacheEntry>();
const groupCache = new Map<string, GroupCacheEntry>();

// ── Service Client ───────────────────────────────────────────────────────────

function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase credentials for ConfigurationService");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ── Core Functions ───────────────────────────────────────────────────────────

/**
 * Get a single business setting value by key.
 * Returns null if not found or not set.
 */
async function get(key: string): Promise<string | null> {
  const cached = settingsCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("business_settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error || !data) {
    return null;
  }

  const value = (data.value as string) ?? null;
  settingsCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

/**
 * Get all business settings in a group as a key-value map.
 */
async function getGroup(groupKey: string): Promise<Record<string, string | null>> {
  const cached = groupCache.get(groupKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.values;
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("business_settings")
    .select("key, value")
    .eq("group_key", groupKey)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return {};
  }

  const values: Record<string, string | null> = {};
  for (const row of data) {
    values[row.key as string] = (row.value as string) ?? null;
  }

  groupCache.set(groupKey, { values, expiresAt: Date.now() + CACHE_TTL_MS });
  return values;
}

/**
 * Get a system setting (super_admin only, not cached for public).
 * Used internally by AI modules, calculators, etc.
 */
async function getSystem(key: string): Promise<string | null> {
  const cacheKey = `system:${key}`;
  const cached = settingsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error || !data) {
    return null;
  }

  const value = (data.value as string) ?? null;
  settingsCache.set(cacheKey, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

/**
 * Get all system settings in a group.
 */
async function getSystemGroup(groupKey: string): Promise<Record<string, string | null>> {
  const cacheKey = `system_group:${groupKey}`;
  const cached = groupCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.values;
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("system_settings")
    .select("key, value")
    .eq("group_key", groupKey)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return {};
  }

  const values: Record<string, string | null> = {};
  for (const row of data) {
    values[row.key as string] = (row.value as string) ?? null;
  }

  groupCache.set(cacheKey, { values, expiresAt: Date.now() + CACHE_TTL_MS });
  return values;
}

/**
 * Get site content by key.
 */
async function getContent(key: string): Promise<string | null> {
  const cacheKey = `content:${key}`;
  const cached = settingsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("value")
    .eq("key", key)
    .single();

  if (error || !data) {
    return null;
  }

  const value = (data.value as string) ?? null;
  settingsCache.set(cacheKey, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

/**
 * Invalidate all caches. Call after any admin setting update.
 */
function invalidateAll(): void {
  settingsCache.clear();
  groupCache.clear();
}

/**
 * Invalidate a specific key from cache.
 */
function invalidate(key: string): void {
  settingsCache.delete(key);
  settingsCache.delete(`system:${key}`);
  settingsCache.delete(`content:${key}`);
  // Also clear group caches since we don't know which group this key belongs to
  groupCache.clear();
}

// ── Export as a single service object ────────────────────────────────────────

export const config = {
  get,
  getGroup,
  getSystem,
  getSystemGroup,
  getContent,
  invalidate,
  invalidateAll,
} as const;
