import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { normalizeSettings } from "../settings";
import { normalizeData } from "../storage";
import type { AppData } from "../types";

const STUDIO_ROW_ID = "main";

/** 兼容用户误填 /rest/v1/ 的情况 */
function normalizeSupabaseUrl(url: string): string {
  return url.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
}

function emptyPayload(): AppData {
  return normalizeData({});
}

export function createAdminClient(): SupabaseClient {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL);
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("未配置 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isServerCloudConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function loadCloudData(): Promise<{
  data: AppData;
  updatedAt: string | null;
}> {
  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("studio_data")
    .select("payload, updated_at")
    .eq("id", STUDIO_ROW_ID)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) {
    const initial = emptyPayload();
    const { error: insertError } = await supabase.from("studio_data").insert({
      id: STUDIO_ROW_ID,
      payload: initial,
    });
    if (insertError) throw new Error(insertError.message);
    return { data: initial, updatedAt: new Date().toISOString() };
  }

  return {
    data: normalizeData(row.payload as Partial<AppData>),
    updatedAt: row.updated_at as string,
  };
}

export async function saveCloudData(payload: AppData): Promise<string> {
  const supabase = createAdminClient();
  const normalized = normalizeData(payload);
  const updatedAt = new Date().toISOString();
  const { error } = await supabase.from("studio_data").upsert({
    id: STUDIO_ROW_ID,
    payload: normalized,
    updated_at: updatedAt,
  });
  if (error) throw new Error(error.message);
  return updatedAt;
}

export function validateWriteKey(headerKey: string | null): boolean {
  const required = process.env.STUDIO_WRITE_KEY;
  if (!required) return true;
  return headerKey === required;
}

/** 供 SQL 初始化默认 settings 结构 */
export { normalizeSettings };
