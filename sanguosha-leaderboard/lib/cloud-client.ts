import type { AppData } from "./types";

/** 是否使用 Supabase 云端（客户端） */
export function isCloudMode(): boolean {
  return process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase";
}

export const STUDIO_WRITE_KEY_STORAGE = "sgs-studio-write-key";

export function getStudioWriteKey(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(STUDIO_WRITE_KEY_STORAGE) ?? "";
}

export function setStudioWriteKey(key: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STUDIO_WRITE_KEY_STORAGE, key);
}

export interface CloudDataResponse {
  data: AppData;
  updatedAt: string | null;
}

export async function fetchCloudData(): Promise<CloudDataResponse> {
  const res = await fetch("/api/data", { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `加载失败 (${res.status})`);
  }
  return res.json();
}

export async function saveCloudData(data: AppData): Promise<void> {
  const res = await fetch("/api/data", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-studio-key": getStudioWriteKey(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error("WRITE_KEY_REQUIRED");
    throw new Error(err.error ?? `保存失败 (${res.status})`);
  }
}
