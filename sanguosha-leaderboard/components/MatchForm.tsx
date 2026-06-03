"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RESULT_LABELS } from "@/lib/constants";
import { getGenerals, getIdentities, getParticipantPoints } from "@/lib/settings";
import type { AppData, MatchParticipant, MatchResult, Player } from "@/lib/types";

export interface MatchFormValues {
  date: string;
  mode: string;
  notes: string;
  participants: MatchParticipant[];
}

interface ParticipantForm {
  playerId: string;
  identity: string;
  general: string;
  result: MatchResult;
}

interface Props {
  data: AppData;
  players: Player[];
  modes: string[];
  initial: MatchFormValues;
  title: string;
  submitLabel: string;
  cancelHref: string;
  onSubmit: (values: MatchFormValues) => void;
}

function participantsToState(
  participants: MatchParticipant[],
  defaultIdentity: string
) {
  const selectedIds = participants.map((p) => p.playerId);
  const forms: Record<string, ParticipantForm> = {};
  for (const p of participants) {
    forms[p.playerId] = { ...p };
  }
  return { selectedIds, forms, defaultIdentity };
}

export function MatchForm({
  data,
  players,
  modes,
  initial,
  title,
  submitLabel,
  cancelHref,
  onSubmit,
}: Props) {
  const legacyIdentities = initial.participants.map((p) => p.identity);
  const legacyGenerals = initial.participants.map((p) => p.general);
  const identities = useMemo(
    () => getIdentities(data, legacyIdentities),
    [data, legacyIdentities]
  );
  const generals = useMemo(
    () => getGenerals(data, legacyGenerals),
    [data, legacyGenerals]
  );
  const defaultIdentity = identities[0] ?? "";

  const [date, setDate] = useState(initial.date);
  const [mode, setMode] = useState(
    modes.includes(initial.mode) ? initial.mode : modes[0] ?? ""
  );
  const [notes, setNotes] = useState(initial.notes);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [forms, setForms] = useState<Record<string, ParticipantForm>>({});
  const [error, setError] = useState("");
  const [generalFilter, setGeneralFilter] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const { selectedIds: ids, forms: f } = participantsToState(
      initial.participants,
      defaultIdentity
    );
    setDate(initial.date);
    setMode(modes.includes(initial.mode) ? initial.mode : modes[0] ?? "");
    setNotes(initial.notes);
    setSelectedIds(ids);
    setForms(f);
    setInitialized(true);
  }, [initial, modes, defaultIdentity]);

  if (!initialized) return null;

  const togglePlayer = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
      const next = { ...forms };
      delete next[id];
      setForms(next);
    } else {
      setSelectedIds([...selectedIds, id]);
      setForms({
        ...forms,
        [id]: {
          playerId: id,
          identity: defaultIdentity,
          general: "",
          result: "win",
        },
      });
    }
  };

  const updateForm = (
    playerId: string,
    field: keyof Omit<ParticipantForm, "playerId">,
    value: string
  ) => {
    const current = forms[playerId];
    if (!current) return;
    setForms({
      ...forms,
      [playerId]: { ...current, [field]: value },
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedIds.length === 0) {
      setError("请至少选择一名参与玩家");
      return;
    }

    if (identities.length === 0) {
      setError("请先在「数据」页配置可选身份");
      return;
    }

    const participants: MatchParticipant[] = [];
    for (const id of selectedIds) {
      const f = forms[id];
      if (!f.identity) {
        setError("请为每位玩家选择身份");
        return;
      }
      participants.push({
        playerId: id,
        identity: f.identity,
        general: f.general,
        result: f.result,
      });
    }

    onSubmit({ date, mode, notes: notes.trim(), participants });
  };

  const filterGenerals = (options: string[]) => {
    const q = generalFilter.trim().toLowerCase();
    if (!q) return options;
    return options.filter((g) => g.toLowerCase().includes(q));
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-sgs-gold-light mb-1">{title}</h1>
        <p className="text-sm text-sgs-muted">
          从列表选择身份与武将；积分按「数据」页中的身份加分规则计算
        </p>
      </section>

      {identities.length === 0 && (
        <div className="sgs-card p-4 text-sm text-amber-400/90">
          尚未配置身份列表，请前往{" "}
          <Link href="/data" className="underline text-sgs-gold-light">
            数据页
          </Link>{" "}
          添加。
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="sgs-card p-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="sgs-label" htmlFor="match-date">
              日期
            </label>
            <input
              id="match-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="sgs-input"
              required
            />
          </div>
          <div>
            <label className="sgs-label" htmlFor="match-mode">
              模式
            </label>
            <select
              id="match-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="sgs-input"
            >
              {modes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="sgs-label" htmlFor="match-notes">
              备注
            </label>
            <input
              id="match-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="可选"
              className="sgs-input"
              maxLength={200}
            />
          </div>
        </div>

        <div className="sgs-card p-4">
          <p className="sgs-label mb-3">参与玩家（点击选择）</p>
          <div className="flex flex-wrap gap-2">
            {players.map((p) => {
              const on = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlayer(p.id)}
                  className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                    on
                      ? "bg-sgs-red/60 border-sgs-gold text-sgs-gold-light"
                      : "border-sgs-border text-sgs-muted hover:border-sgs-gold/50"
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="sgs-card p-4">
            <label className="sgs-label" htmlFor="general-filter">
              武将搜索（筛选下方下拉列表）
            </label>
            <input
              id="general-filter"
              type="search"
              value={generalFilter}
              onChange={(e) => setGeneralFilter(e.target.value)}
              placeholder="输入关键字，如 界·赵云、SP"
              className="sgs-input"
            />
          </div>
        )}

        {selectedIds.length > 0 && (
          <div className="space-y-3">
            {selectedIds.map((id) => {
              const player = players.find((p) => p.id === id);
              const f = forms[id];
              if (!player || !f) return null;

              const preview = getParticipantPoints(data, {
                playerId: id,
                identity: f.identity,
                general: f.general,
                result: f.result,
              });

              const identityOptions = f.identity && !identities.includes(f.identity)
                ? [f.identity, ...identities]
                : identities;

              const generalOptions = filterGenerals(
                f.general && !generals.includes(f.general) && f.general !== ""
                  ? [f.general, ...generals]
                  : generals
              );

              return (
                <div
                  key={id}
                  className="sgs-card p-4 border-l-4 border-l-sgs-gold"
                >
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <h3 className="font-medium text-sgs-gold-light">
                      {player.name}
                    </h3>
                    {f.identity && (
                      <span className="text-xs rounded-full bg-sgs-bg border border-sgs-gold/40 px-2 py-0.5 text-sgs-gold-light">
                        本局 +{preview} 分
                      </span>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="sgs-label">身份</label>
                      <select
                        value={f.identity}
                        onChange={(e) =>
                          updateForm(id, "identity", e.target.value)
                        }
                        className="sgs-input"
                        required
                      >
                        <option value="">请选择身份</option>
                        {identityOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="sgs-label">武将</label>
                      <select
                        value={f.general}
                        onChange={(e) =>
                          updateForm(id, "general", e.target.value)
                        }
                        className="sgs-input"
                      >
                        <option value="">可不选</option>
                        {generalOptions.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="sgs-label">结果</label>
                      <div className="flex gap-2 max-w-xs">
                        {(["win", "lose"] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => updateForm(id, "result", r)}
                            className={`flex-1 sgs-btn text-sm ${
                              f.result === r
                                ? r === "win"
                                  ? "bg-green-800/60 border-green-600 text-green-100"
                                  : "bg-red-900/60 border-red-700 text-red-100"
                                : "sgs-btn-secondary"
                            }`}
                          >
                            {RESULT_LABELS[r]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-2">
          <button type="submit" className="sgs-btn-primary">
            {submitLabel}
          </button>
          <Link href={cancelHref} className="sgs-btn-secondary text-center">
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
