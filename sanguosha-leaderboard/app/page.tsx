"use client";

import { useMemo, useState } from "react";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { PointsLeaderboardTable } from "@/components/PointsLeaderboardTable";
import { Loading } from "@/components/Loading";
import { useAppDataStore } from "@/components/AppDataProvider";
import { setMinGames } from "@/lib/settings";
import {
  computeLeaderboard,
  computePointsLeaderboard,
  getUsedGenerals,
  getUsedIdentities,
} from "@/lib/stats";

type Tab = "winrate" | "points";

export default function HomePage() {
  const { data, ready, persist } = useAppDataStore();
  const [tab, setTab] = useState<Tab>("winrate");
  const [identityFilter, setIdentityFilter] = useState("");
  const [generalFilter, setGeneralFilter] = useState("");

  const minGames = data?.settings.minGames ?? 3;

  const filters = useMemo(
    () => ({ identity: identityFilter, general: generalFilter }),
    [identityFilter, generalFilter]
  );

  const identityOptions = useMemo(
    () => (data ? getUsedIdentities(data) : []),
    [data]
  );

  const generalOptions = useMemo(
    () => (data ? getUsedGenerals(data) : []),
    [data]
  );

  const winRows = useMemo(() => {
    if (!data) return [];
    return computeLeaderboard(data, minGames, filters);
  }, [data, minGames, filters]);

  const pointRows = useMemo(() => {
    if (!data) return [];
    return computePointsLeaderboard(data, filters);
  }, [data, filters]);

  if (!ready || !data) return <Loading />;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-sgs-gold-light mb-1">
          工作室排行榜
        </h1>
        <p className="text-sm text-sgs-muted">
          共 {data.matches.length} 局 · {data.players.length} 名玩家
        </p>
      </section>

      <div className="flex gap-2 p-1 rounded-lg bg-sgs-card border border-sgs-border w-fit">
        <button
          type="button"
          onClick={() => setTab("winrate")}
          className={`rounded-md px-4 py-1.5 text-sm transition-colors ${
            tab === "winrate"
              ? "bg-sgs-red/80 text-sgs-gold-light"
              : "text-sgs-muted hover:text-sgs-parchment"
          }`}
        >
          胜率榜
        </button>
        <button
          type="button"
          onClick={() => setTab("points")}
          className={`rounded-md px-4 py-1.5 text-sm transition-colors ${
            tab === "points"
              ? "bg-sgs-red/80 text-sgs-gold-light"
              : "text-sgs-muted hover:text-sgs-parchment"
          }`}
        >
          积分榜
        </button>
      </div>

      {tab === "winrate" ? (
        <LeaderboardTable
          rows={winRows}
          minGames={minGames}
          identityFilter={identityFilter}
          generalFilter={generalFilter}
          identityOptions={identityOptions}
          generalOptions={generalOptions}
          onMinGamesChange={(n) => persist(setMinGames(data, n))}
          onIdentityFilterChange={setIdentityFilter}
          onGeneralFilterChange={setGeneralFilter}
        />
      ) : (
        <PointsLeaderboardTable
          rows={pointRows}
          identityFilter={identityFilter}
          generalFilter={generalFilter}
          identityOptions={identityOptions}
          generalOptions={generalOptions}
          onIdentityFilterChange={setIdentityFilter}
          onGeneralFilterChange={setGeneralFilter}
        />
      )}
    </div>
  );
}
