"use client";

import { AppDataProvider } from "@/components/AppDataProvider";
import { Nav } from "@/components/Nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppDataProvider>
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </AppDataProvider>
  );
}
