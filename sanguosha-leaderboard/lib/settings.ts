import { DEFAULT_GAME_MODES, DEFAULT_IDENTITIES, DEFAULT_MIN_GAMES } from "./constants";
import { DEFAULT_GENERALS } from "./default-generals";
import { getRoleScore } from "./points";
import type { AppData, AppSettings } from "./types";

export const defaultSettings = (): AppSettings => ({
  minGames: DEFAULT_MIN_GAMES,
  customModes: [],
  customIdentities: [],
  customGenerals: [],
  roleScores: DEFAULT_IDENTITIES.map((role) => ({ role, points: 0 })),
  winBonus: 0,
  loseBonus: 0,
});

/** 规范化 settings（兼容旧数据） */
export function normalizeSettings(raw?: Partial<AppSettings>): AppSettings {
  const base = defaultSettings();
  const customIdentities = raw?.customIdentities ?? [];
  const roleScoresRaw = raw?.roleScores ?? base.roleScores;

  const map = new Map<string, number>();
  for (const r of roleScoresRaw) {
    map.set(r.role, typeof r.points === "number" ? r.points : 0);
  }
  for (const role of DEFAULT_IDENTITIES) {
    if (!map.has(role)) map.set(role, 0);
  }
  for (const id of customIdentities) {
    if (!map.has(id)) map.set(id, 0);
  }

  return {
    minGames: raw?.minGames ?? base.minGames,
    customModes: raw?.customModes ?? [],
    customIdentities,
    customGenerals: raw?.customGenerals ?? [],
    roleScores: [...map.entries()].map(([role, points]) => ({ role, points })),
    winBonus: raw?.winBonus ?? 0,
    loseBonus: raw?.loseBonus ?? 0,
  };
}

/** 内置 + 自定义模式（去重） */
export function getGameModes(data: AppData): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const m of [...DEFAULT_GAME_MODES, ...data.settings.customModes]) {
    if (!seen.has(m)) {
      seen.add(m);
      list.push(m);
    }
  }
  return list;
}

/** 可选身份列表 */
export function getIdentities(data: AppData, extra?: string[]): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const id of [
    ...DEFAULT_IDENTITIES,
    ...data.settings.customIdentities,
    ...(extra ?? []),
  ]) {
    const t = id.trim();
    if (t && !seen.has(t)) {
      seen.add(t);
      list.push(t);
    }
  }
  return list;
}

/** 可选武将列表（内置 + 自定义） */
export function getGenerals(data: AppData, extra?: string[]): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const g of [
    ...DEFAULT_GENERALS,
    ...data.settings.customGenerals,
    ...(extra ?? []),
  ]) {
    const t = g.trim();
    if (t && !seen.has(t)) {
      seen.add(t);
      list.push(t);
    }
  }
  return list;
}

export { getParticipantPoints, getRoleScore } from "./points";

export function setMinGames(data: AppData, minGames: number): AppData {
  return {
    ...data,
    settings: {
      ...data.settings,
      minGames: Math.max(0, Math.min(99, minGames)),
    },
  };
}

export function addCustomMode(data: AppData, name: string): AppData {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("模式名不能为空");
  const all = getGameModes(data);
  if (all.includes(trimmed)) throw new Error("该模式已存在");
  return {
    ...data,
    settings: {
      ...data.settings,
      customModes: [...data.settings.customModes, trimmed],
    },
  };
}

export function removeCustomMode(data: AppData, name: string): AppData {
  return {
    ...data,
    settings: {
      ...data.settings,
      customModes: data.settings.customModes.filter((m) => m !== name),
    },
  };
}

export function addCustomIdentity(data: AppData, name: string): AppData {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("身份名不能为空");
  if (getIdentities(data).includes(trimmed)) throw new Error("该身份已存在");
  return upsertRoleScore(
    {
      ...data,
      settings: {
        ...data.settings,
        customIdentities: [...data.settings.customIdentities, trimmed],
      },
    },
    trimmed,
    getRoleScore(data, trimmed)
  );
}

export function removeCustomIdentity(data: AppData, name: string): AppData {
  if ((DEFAULT_IDENTITIES as readonly string[]).includes(name)) {
    throw new Error("内置身份不可删除");
  }
  return {
    ...data,
    settings: {
      ...data.settings,
      customIdentities: data.settings.customIdentities.filter((i) => i !== name),
      roleScores: data.settings.roleScores.filter((r) => r.role !== name),
    },
  };
}

export function addCustomGeneral(data: AppData, name: string): AppData {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("武将名不能为空");
  if (getGenerals(data).includes(trimmed)) throw new Error("该武将已存在");
  return {
    ...data,
    settings: {
      ...data.settings,
      customGenerals: [...data.settings.customGenerals, trimmed],
    },
  };
}

export function removeCustomGeneral(data: AppData, name: string): AppData {
  if ((DEFAULT_GENERALS as readonly string[]).includes(name)) {
    throw new Error("内置武将不可删除");
  }
  return {
    ...data,
    settings: {
      ...data.settings,
      customGenerals: data.settings.customGenerals.filter((g) => g !== name),
    },
  };
}

export function upsertRoleScore(
  data: AppData,
  role: string,
  points: number
): AppData {
  const trimmed = role.trim();
  const safePoints = Number.isFinite(points) ? Math.round(points) : 0;
  const exists = data.settings.roleScores.some((r) => r.role === trimmed);
  const roleScores = exists
    ? data.settings.roleScores.map((r) =>
        r.role === trimmed ? { ...r, points: safePoints } : r
      )
    : [...data.settings.roleScores, { role: trimmed, points: safePoints }];
  return { ...data, settings: { ...data.settings, roleScores } };
}

export function setWinBonus(data: AppData, winBonus: number): AppData {
  return {
    ...data,
    settings: {
      ...data.settings,
      winBonus: Math.round(winBonus),
    },
  };
}

export function setLoseBonus(data: AppData, loseBonus: number): AppData {
  return {
    ...data,
    settings: {
      ...data.settings,
      loseBonus: Math.round(loseBonus),
    },
  };
}
