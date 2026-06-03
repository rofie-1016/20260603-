export const STORAGE_KEY = "sgs-studio-leaderboard-v1";

export const DEFAULT_MIN_GAMES = 3;

/** 内置模式，不可删除 */
export const DEFAULT_GAME_MODES = [
  "身份场",
  "国战",
  "2v2",
  "1v1",
  "活动局",
  "其他",
] as const;

export const RESULT_LABELS: Record<"win" | "lose", string> = {
  win: "胜",
  lose: "负",
};

/** 内置身份（可选列表，不可删除） */
export const DEFAULT_IDENTITIES = [
  "主公",
  "忠臣",
  "反贼",
  "内奸",
  "地主",
  "农民",
  "先手",
  "后手",
] as const;
