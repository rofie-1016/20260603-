import { STORAGE_KEY } from "./constants";
import { normalizeSettings } from "./settings";
import type { AppData, Match, Player } from "./types";

const emptyData = (): AppData => ({
  players: [],
  matches: [],
  settings: normalizeSettings(),
});

export function normalizeData(raw: Partial<AppData>): AppData {
  return {
    players: raw.players ?? [],
    matches: raw.matches ?? [],
    settings: normalizeSettings(raw.settings),
  };
}

/** 从 localStorage 读取；未来可替换为 Supabase fetch */
export function loadData(): AppData {
  if (typeof window === "undefined") return emptyData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    return normalizeData(JSON.parse(raw) as Partial<AppData>);
  } catch {
    return emptyData();
  }
}

/** 写入 localStorage；未来可替换为 Supabase upsert */
export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// —— 玩家 ——

export function addPlayer(data: AppData, name: string): AppData {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("玩家名不能为空");
  if (data.players.some((p) => p.name === trimmed)) {
    throw new Error("玩家名已存在");
  }
  const player: Player = {
    id: generateId(),
    name: trimmed,
    createdAt: new Date().toISOString(),
  };
  return { ...data, players: [...data.players, player] };
}

export function removePlayer(data: AppData, playerId: string): AppData {
  return {
    ...data,
    players: data.players.filter((p) => p.id !== playerId),
    matches: data.matches.map((m) => ({
      ...m,
      participants: m.participants.filter((p) => p.playerId !== playerId),
    })),
  };
}

// —— 对局 ——

export function addMatch(
  data: AppData,
  match: Omit<Match, "id" | "createdAt">
): AppData {
  const full: Match = {
    ...match,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  return { ...data, matches: [full, ...data.matches] };
}

export function updateMatch(
  data: AppData,
  matchId: string,
  patch: Omit<Match, "id" | "createdAt">
): AppData {
  const exists = data.matches.some((m) => m.id === matchId);
  if (!exists) throw new Error("对局不存在");
  return {
    ...data,
    matches: data.matches.map((m) =>
      m.id === matchId ? { ...m, ...patch } : m
    ),
  };
}

export function getMatch(data: AppData, matchId: string): Match | undefined {
  return data.matches.find((m) => m.id === matchId);
}

export function removeMatch(data: AppData, matchId: string): AppData {
  return {
    ...data,
    matches: data.matches.filter((m) => m.id !== matchId),
  };
}

export function exportJson(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importJson(json: string): AppData {
  const parsed = JSON.parse(json) as Partial<AppData>;
  if (!Array.isArray(parsed.players) || !Array.isArray(parsed.matches)) {
    throw new Error("JSON 格式无效");
  }
  return normalizeData(parsed);
}
