"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "排行榜" },
  { href: "/players", label: "玩家" },
  { href: "/matches/new", label: "录入" },
  { href: "/data", label: "数据" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-sgs-border bg-sgs-bg/95 backdrop-blur">
      <div className="mx-auto max-w-4xl px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-sgs-gold-light tracking-wide">
              三国杀工作室
            </span>
            <span className="text-sm text-sgs-muted">战绩榜</span>
          </Link>
          <nav className="flex flex-wrap gap-1">
            {links.map(({ href, label }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-sgs-red/80 text-sgs-gold-light border border-sgs-gold/30"
                      : "text-sgs-muted hover:text-sgs-parchment hover:bg-sgs-card"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
