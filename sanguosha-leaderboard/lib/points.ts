import type { AppData, MatchParticipant } from "./types";

export function getRoleScore(data: AppData, role: string): number {
  const rule = data.settings.roleScores.find((r) => r.role === role);
  return rule?.points ?? 0;
}

/** 单条对局记录应得积分（不依赖武将库，供排行榜等轻量页面使用） */
export function getParticipantPoints(
  data: AppData,
  p: MatchParticipant
): number {
  let pts = 0;
  if (p.identity) pts += getRoleScore(data, p.identity);
  if (p.result === "win") pts += data.settings.winBonus;
  else pts += data.settings.loseBonus;
  return pts;
}
