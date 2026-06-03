/** 对局结果 */
export type MatchResult = "win" | "lose";

/** 玩家 */
export interface Player {
  id: string;
  name: string;
  createdAt: string;
}

/** 单局中的玩家记录 */
export interface MatchParticipant {
  playerId: string;
  identity: string;
  general: string;
  result: MatchResult;
}

/** 对局 */
export interface Match {
  id: string;
  date: string;
  mode: string;
  notes: string;
  participants: MatchParticipant[];
  createdAt: string;
}

/** 身份（角色）积分规则 */
export interface RoleScoreRule {
  role: string;
  points: number;
}

/** 应用设置（localStorage / 未来 settings 表） */
export interface AppSettings {
  minGames: number;
  customModes: string[];
  /** 额外可选身份 */
  customIdentities: string[];
  /** 可选武将列表 */
  customGenerals: string[];
  /** 各身份对局加分 */
  roleScores: RoleScoreRule[];
  /** 胜局额外加分（可选） */
  winBonus: number;
  /** 负局额外加分（可为 0 或负数） */
  loseBonus: number;
}

/** 应用数据（与 localStorage / 未来 Supabase 表结构对齐） */
export interface AppData {
  players: Player[];
  matches: Match[];
  settings: AppSettings;
}

/** 胜率排行榜行 */
export interface LeaderboardRow {
  playerId: string;
  playerName: string;
  total: number;
  wins: number;
  losses: number;
  winRate: number;
  insufficientSample: boolean;
  topIdentity: string;
  topGeneral: string;
}

/** 积分排行榜行 */
export interface PointsLeaderboardRow {
  playerId: string;
  playerName: string;
  totalGames: number;
  points: number;
  topIdentity: string;
  topGeneral: string;
}

/** 排行榜筛选 */
export interface LeaderboardFilters {
  identity: string;
  general: string;
}
