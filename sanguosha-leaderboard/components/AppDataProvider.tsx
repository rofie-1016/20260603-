"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAppData } from "@/lib/hooks/useAppData";
import type { AppData } from "@/lib/types";
import { CloudStatus } from "./CloudStatus";
import { WriteKeyModal } from "./WriteKeyModal";

type AppDataContextValue = ReturnType<typeof useAppData>;

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const value = useAppData();

  return (
    <AppDataContext.Provider value={value}>
      <WriteKeyModal
        open={value.writeKeyRequired}
        onSubmit={value.submitWriteKey}
        onCancel={value.dismissWriteKey}
      />
      <CloudStatus
        cloud={value.cloud}
        syncing={value.syncing}
        error={value.cloudError}
      />
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppDataContext(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppDataContext 需在 AppDataProvider 内使用");
  return ctx;
}

/** 便捷：仅取 data / persist */
export function useAppDataStore(): {
  data: AppData | null;
  ready: boolean;
  persist: (next: AppData) => void;
} {
  const { data, ready, persist } = useAppDataContext();
  return { data, ready, persist };
}
