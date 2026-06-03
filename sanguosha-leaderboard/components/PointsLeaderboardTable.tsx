"use client";

import type { PointsLeaderboardRow } from "@/lib/types";
import { LeaderboardFiltersBar } from "./LeaderboardFiltersBar";

interface Props {
  rows: PointsLeaderboardRow[];
  identityFilter: string;
  generalFilter: string;
  identityOptions: string[];
  generalOptions: string[];
  onIdentityFilterChange: (v: string) => void;
  onGeneralFilterChange: (v: string) => void;
}

function dash(value: string) {
  return value || "—";
}

export function PointsLeaderboardTable({
  rows,
  identityFilter,
  generalFilter,
  identityOptions,
  generalOptions,
  onIdentityFilterChange,
  onGeneralFilterChange,
}: Props) {
  let rank = 0;

  return (
    <div className="space-y-4">
      <LeaderboardFiltersBar
        identity={identityFilter}
        general={generalFilter}
        identityOptions={identityOptions}
        generalOptions={generalOptions}
        onIdentityChange={onIdentityFilterChange}
        onGeneralChange={onGeneralFilterChange}
      />

      <div className="sgs-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sgs-border bg-sgs-bg/50 text-sgs-muted text-left">
                <th className="px-3 py-3 w-12">排名</th>
                <th className="px-3 py-3">玩家</th>
                <th className="px-3 py-3 hidden md:table-cell">常用身份</th>
                <th className="px-3 py-3 hidden lg:table-cell">常用武将</th>
                <th className="px-3 py-3 text-center hidden sm:table-cell">局数</th>
                <th className="px-3 py-3 text-right">总积分</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sgs-muted">
                    暂无数据
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const displayRank = row.totalGames === 0 ? "—" : String(++rank);
                  const isTop = row.totalGames > 0 && rank <= 3;

                  return (
                    <tr
                      key={row.playerId}
                      className="border-b border-sgs-border/50 hover:bg-sgs-bg/30"
                    >
                      <td className="px-3 py-3">
                        <span
                          className={
                            isTop
                              ? "font-bold text-sgs-gold-light"
                              : "text-sgs-muted"
                          }
                        >
                          {displayRank}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium">{row.playerName}</div>
                        <div className="md:hidden text-xs text-sgs-muted mt-0.5">
                          {dash(row.topIdentity)} · {dash(row.topGeneral)}
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell text-sgs-muted">
                        {dash(row.topIdentity)}
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        {dash(row.topGeneral)}
                      </td>
                      <td className="px-3 py-3 text-center text-sgs-muted hidden sm:table-cell">
                        {row.totalGames}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-sgs-gold-light">
                        {row.points}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="px-3 py-2 text-xs text-sgs-muted border-t border-sgs-border">
          积分 = 身份加分 + 胜负额外分；可按身份/武将筛选统计
        </p>
      </div>
    </div>
  );
}
