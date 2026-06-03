"use client";

import { useMemo, useState } from "react";
import type { AppData } from "@/lib/types";
import {
  getIdentities,
  setLoseBonus,
  setWinBonus,
  upsertRoleScore,
} from "@/lib/settings";

interface Props {
  data: AppData;
  onPersist: (next: AppData) => void;
}

export function RoleScoreManager({ data, onPersist }: Props) {
  const identities = useMemo(() => getIdentities(data), [data]);
  const [savedHint, setSavedHint] = useState("");

  const flash = () => {
    setSavedHint("已保存");
    setTimeout(() => setSavedHint(""), 1500);
  };

  return (
    <div className="sgs-card p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-medium text-sgs-gold-light">身份积分规则</h2>
        {savedHint && (
          <span className="text-xs text-green-400">{savedHint}</span>
        )}
      </div>
      <p className="text-xs text-sgs-muted">
        每局按所选身份加分，并可叠加胜负额外分。录入时会显示预计得分。
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="sgs-label">胜局额外加分</span>
          <input
            type="number"
            className="sgs-input mt-1"
            value={data.settings.winBonus}
            onChange={(e) => {
              onPersist(
                setWinBonus(data, parseInt(e.target.value, 10) || 0)
              );
              flash();
            }}
          />
        </label>
        <label className="text-sm">
          <span className="sgs-label">负局额外加分</span>
          <input
            type="number"
            className="sgs-input mt-1"
            value={data.settings.loseBonus}
            onChange={(e) => {
              onPersist(
                setLoseBonus(data, parseInt(e.target.value, 10) || 0)
              );
              flash();
            }}
          />
        </label>
      </div>

      <div className="border border-sgs-border rounded-md overflow-hidden max-h-64 overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-sgs-bg/50 text-sgs-muted text-left border-b border-sgs-border">
              <th className="px-3 py-2">身份</th>
              <th className="px-3 py-2 w-28 text-right">每局加分</th>
            </tr>
          </thead>
          <tbody>
            {identities.map((role) => {
              const rule = data.settings.roleScores.find((r) => r.role === role);
              const points = rule?.points ?? 0;
              return (
                <tr
                  key={role}
                  className="border-b border-sgs-border/40 last:border-0"
                >
                  <td className="px-3 py-2">{role}</td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      className="sgs-input w-20 text-center ml-auto"
                      value={points}
                      onChange={(e) => {
                        onPersist(
                          upsertRoleScore(
                            data,
                            role,
                            parseInt(e.target.value, 10) || 0
                          )
                        );
                        flash();
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
