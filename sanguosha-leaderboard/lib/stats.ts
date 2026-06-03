import { getParticipantPoints } from "./points";
import type {
  AppData,
  LeaderboardFilters,
  LeaderboardRow,
  PointsLeaderboardRow,
} from "./types";

function topFromCounts(counts: Map<string, number>): string {
  let best = "";
  let max = 0;
  for (const [key, count] of counts) {
    if (!key || count <= max) continue;
    max = count;
    best = key;
  }
  return best;
}

function matchesFilters(
  p: { identity: string; general: string },
  filters: LeaderboardFilters
): boolean {
  if (filters.identity && p.identity !== filters.identity) return false;
  if (filters.general && p.general !== filters.general) return false;
  return true;
}

export function getUsedIdentities(data: AppData): string[] {
  const set = new Set<string>();
  for (const m of data.matches) {
    for (const p of m.participants) {
      if (p.identity) set.add(p.identity);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

export function getUsedGenerals(data: AppData): string[] {
  const set = new Set<string>();
  for (const m of data.matches) {
    for (const p of m.participants) {
      if (p.general) set.add(p.general);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

export function computeLeaderboard(
  data: AppData,
  minGames: number,
  filters: LeaderboardFilters = { identity: "", general: "" }
): LeaderboardRow[] {
  const stats = new Map<
    string,
    {
      wins: number;
      losses: number;
      name: string;
      identities: Map<string, number>;
      generals: Map<string, number>;
    }
  >();

  for (const player of data.players) {
    stats.set(player.id, {
      wins: 0,
      losses: 0,
      name: player.name,
      identities: new Map(),
      generals: new Map(),
    });
  }

  for (const match of data.matches) {
    for (const p of match.participants) {
      if (!matchesFilters(p, filters)) continue;
      const row = stats.get(p.playerId);
      if (!row) continue;
      if (p.result === "win") row.wins += 1;
      else row.losses += 1;
      if (p.identity) {
        row.identities.set(p.identity, (row.identities.get(p.identity) ?? 0) + 1);
      }
      if (p.general) {
        row.generals.set(p.general, (row.generals.get(p.general) ?? 0) + 1);
      }
    }
  }

  const rows: LeaderboardRow[] = [];

  for (const [playerId, { wins, losses, name, identities, generals }] of stats) {
    const total = wins + losses;
    const winRate = total > 0 ? wins / total : 0;
    rows.push({
      playerId,
      playerName: name,
      total,
      wins,
      losses,
      winRate,
      insufficientSample: total < minGames,
      topIdentity: topFromCounts(identities),
      topGeneral: topFromCounts(generals),
    });
  }

  return rows.sort((a, b) => {
    if (a.insufficientSample !== b.insufficientSample) {
      return a.insufficientSample ? 1 : -1;
    }
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    if (b.total !== a.total) return b.total - a.total;
    return a.playerName.localeCompare(b.playerName, "zh-CN");
  });
}

export function computePointsLeaderboard(
  data: AppData,
  filters: LeaderboardFilters = { identity: "", general: "" }
): PointsLeaderboardRow[] {
  const stats = new Map<
    string,
    {
      points: number;
      games: number;
      name: string;
      identities: Map<string, number>;
      generals: Map<string, number>;
    }
  >();

  for (const player of data.players) {
    stats.set(player.id, {
      points: 0,
      games: 0,
      name: player.name,
      identities: new Map(),
      generals: new Map(),
    });
  }

  for (const match of data.matches) {
    for (const p of match.participants) {
      if (!matchesFilters(p, filters)) continue;
      const row = stats.get(p.playerId);
      if (!row) continue;
      row.games += 1;
      row.points += getParticipantPoints(data, p);
      if (p.identity) {
        row.identities.set(p.identity, (row.identities.get(p.identity) ?? 0) + 1);
      }
      if (p.general) {
        row.generals.set(p.general, (row.generals.get(p.general) ?? 0) + 1);
      }
    }
  }

  const rows: PointsLeaderboardRow[] = [];
  for (const [playerId, { points, games, name, identities, generals }] of stats) {
    rows.push({
      playerId,
      playerName: name,
      totalGames: games,
      points,
      topIdentity: topFromCounts(identities),
      topGeneral: topFromCounts(generals),
    });
  }

  return rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.totalGames !== a.totalGames) return b.totalGames - a.totalGames;
    return a.playerName.localeCompare(b.playerName, "zh-CN");
  });
}

export function formatWinRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}
