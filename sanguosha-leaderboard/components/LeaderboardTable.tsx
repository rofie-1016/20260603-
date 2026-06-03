"use client";

import { formatWinRate } from "@/lib/stats";
import type { LeaderboardRow } from "@/lib/types";
import { LeaderboardFiltersBar } from "./LeaderboardFiltersBar";

interface Props {
  rows: LeaderboardRow[];
  minGames: number;
  identityFilter: string;
  generalFilter: string;
  identityOptions: string[];
  generalOptions: string[];
  onMinGamesChange: (n: number) => void;
  onIdentityFilterChange: (v: string) => void;
  onGeneralFilterChange: (v: string) => void;
}

function dash(value: string) {
  return value || "—";
}

export function LeaderboardTable({
  rows,
  minGames,
  identityFilter,
  generalFilter,
  identityOptions,
  generalOptions,
  onMinGamesChange,
  onIdentityFilterChange,
  onGeneralFilterChange,
}: Props) {
  const qualified = rows.filter((r) => !r.insufficientSample);
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

      <div className="sgs-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <p className="text-sm text-sgs-muted">
          按胜率排序 · 未达最低局数显示「样本不足」
        </p>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-sgs-muted whitespace-nowrap">最低参赛局数</span>
          <input
            type="number"
            min={0}
            max={99}
            value={minGames}
            onChange={(e) =>
              onMinGamesChange(
                Math.max(0, parseInt(e.target.value, 10) || 0)
              )
            }
            className="sgs-input w-20 text-center"
          />
        </label>
      </div>

      <div className="sgs-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sgs-border bg-sgs-bg/50 text-sgs-muted text-left">
                <th className="px-3 py-3 w-12">排名</th>
                <th className="px-3 py-3">玩家</th>
                <th className="px-3 py-3 hidden md:table-cell">常用身份</th>
                <th className="px-3 py-3 hidden lg:table-cell">常用武将</th>
                <th className="px-3 py-3 text-center hidden sm:table-cell">总局</th>
                <th className="px-3 py-3 text-center">胜</th>
                <th className="px-3 py-3 text-center">负</th>
                <th className="px-3 py-3 text-right">胜率</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sgs-muted">
                    暂无玩家，请先在「玩家」页添加成员
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const displayRank = row.insufficientSample
                    ? "—"
                    : String(++rank);
                  const isTop =
                    !row.insufficientSample && rank <= 3 && qualified.length > 0;

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
                        {row.total}
                      </td>
                      <td className="px-3 py-3 text-center text-green-400/90">
                        {row.wins}
                      </td>
                      <td className="px-3 py-3 text-center text-red-400/80">
                        {row.losses}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {row.insufficientSample ? (
                          <span className="text-sgs-muted text-xs">
                            样本不足
                          </span>
                        ) : (
                          <span className="font-semibold text-sgs-gold-light">
                            {formatWinRate(row.winRate)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="px-3 py-2 text-xs text-sgs-muted border-t border-sgs-border">
          常用身份/武将为该局数最多的一项；手机端显示在玩家名下方
        </p>
      </div>
    </div>
  );
}
