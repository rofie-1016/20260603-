"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchCloudData,
  isCloudMode,
  saveCloudData,
  setStudioWriteKey,
} from "@/lib/cloud-client";
import { loadData, saveData } from "@/lib/storage";
import type { AppData } from "@/lib/types";

const POLL_MS = 12_000;

export function useAppData() {
  const cloud = isCloudMode();
  const [data, setData] = useState<AppData | null>(null);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [writeKeyRequired, setWriteKeyRequired] = useState(false);
  const updatedAtRef = useRef<string | null>(null);
  const pendingRef = useRef<AppData | null>(null);

  const applyCloud = useCallback((payload: AppData, updatedAt: string | null) => {
    setData(payload);
    saveData(payload);
    updatedAtRef.current = updatedAt;
    setCloudError(null);
  }, []);

  const pullCloud = useCallback(async () => {
    if (!cloud) return;
    try {
      const { data: remote, updatedAt } = await fetchCloudData();
      if (updatedAt !== updatedAtRef.current) {
        applyCloud(remote, updatedAt);
      }
      setCloudError(null);
    } catch (e) {
      setCloudError(e instanceof Error ? e.message : "同步失败");
    }
  }, [cloud, applyCloud]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (cloud) {
        setSyncing(true);
        try {
          const { data: remote, updatedAt } = await fetchCloudData();
          if (!cancelled) applyCloud(remote, updatedAt);
        } catch (e) {
          if (!cancelled) {
            const local = loadData();
            setData(local);
            setCloudError(
              e instanceof Error
                ? `${e.message}（已显示本地缓存）`
                : "云端加载失败（已显示本地缓存）"
            );
          }
        } finally {
          if (!cancelled) {
            setSyncing(false);
            setReady(true);
          }
        }
      } else {
        if (!cancelled) {
          setData(loadData());
          setReady(true);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [cloud, applyCloud]);

  useEffect(() => {
    if (!cloud || !ready) return;
    const timer = setInterval(pullCloud, POLL_MS);
    const onFocus = () => pullCloud();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [cloud, ready, pullCloud]);

  const flushPending = useCallback(
    async (next: AppData, key?: string) => {
      if (key) setStudioWriteKey(key);
      setSyncing(true);
      try {
        await saveCloudData(next);
        const { updatedAt } = await fetchCloudData();
        updatedAtRef.current = updatedAt;
        setWriteKeyRequired(false);
        setCloudError(null);
        pendingRef.current = null;
      } catch (e) {
        if (e instanceof Error && e.message === "WRITE_KEY_REQUIRED") {
          pendingRef.current = next;
          setWriteKeyRequired(true);
          throw e;
        }
        setCloudError(e instanceof Error ? e.message : "保存失败");
        throw e;
      } finally {
        setSyncing(false);
      }
    },
    []
  );

  const persist = useCallback(
    (next: AppData) => {
      setData(next);
      saveData(next);
      if (!cloud) return;
      flushPending(next).catch(() => {});
    },
    [cloud, flushPending]
  );

  const submitWriteKey = useCallback(
    async (key: string) => {
      const pending = pendingRef.current ?? data;
      if (!pending) return;
      setData(pending);
      saveData(pending);
      await flushPending(pending, key);
    },
    [data, flushPending]
  );

  const dismissWriteKey = useCallback(() => {
    setWriteKeyRequired(false);
    pendingRef.current = null;
  }, []);

  const uploadLocalToCloud = useCallback(async () => {
    const local = loadData();
    setData(local);
    saveData(local);
    await flushPending(local);
  }, [flushPending]);

  return {
    data,
    ready,
    persist,
    cloud,
    syncing,
    cloudError,
    writeKeyRequired,
    submitWriteKey,
    dismissWriteKey,
    uploadLocalToCloud,
    refreshCloud: pullCloud,
  };
}
