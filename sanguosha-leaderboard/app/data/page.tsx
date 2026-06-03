"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CatalogManager } from "@/components/CatalogManager";
import { Loading } from "@/components/Loading";
import { ModeManager } from "@/components/ModeManager";
import { RoleScoreManager } from "@/components/RoleScoreManager";
import { RESULT_LABELS } from "@/lib/constants";
import { useAppDataContext, useAppDataStore } from "@/components/AppDataProvider";
import { getParticipantPoints } from "@/lib/settings";
import {
  exportJson,
  importJson,
  removeMatch,
} from "@/lib/storage";

export default function DataPage() {
  const { data, ready, persist } = useAppDataStore();
  const { cloud, uploadLocalToCloud, refreshCloud } = useAppDataContext();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  if (!ready || !data) return <Loading />;

  const playerName = (id: string) =>
    data.players.find((p) => p.id === id)?.name ?? "未知";

  const handleDelete = (matchId: string, date: string) => {
    if (!confirm(`确定删除 ${date} 的这一局？`)) return;
    persist(removeMatch(data, matchId));
    setMessage({ type: "ok", text: "已删除" });
  };

  const handleExport = () => {
    const blob = new Blob([exportJson(data)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sgs-studio-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: "ok", text: "已导出 JSON" });
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const imported = importJson(text);
        if (
          !confirm(
            `将导入 ${imported.players.length} 名玩家、${imported.matches.length} 局对局，覆盖当前本地数据，是否继续？`
          )
        ) {
          return;
        }
        persist(imported);
        setMessage({ type: "ok", text: "导入成功" });
      } catch (err) {
        setMessage({
          type: "err",
          text: err instanceof Error ? err.message : "导入失败",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-sgs-gold-light mb-1">数据管理</h1>
        <p className="text-sm text-sgs-muted">
          身份武将库 · 积分规则 · 导入导出
        </p>
      </section>

      <RoleScoreManager data={data} onPersist={persist} />
      <CatalogManager data={data} onPersist={persist} />
      <ModeManager data={data} onPersist={persist} />

      {cloud && (
        <div className="sgs-card p-4 flex flex-col sm:flex-row flex-wrap gap-2">
          <button
            type="button"
            className="sgs-btn-secondary"
            onClick={async () => {
              try {
                await refreshCloud();
                setMessage({ type: "ok", text: "已从云端刷新" });
              } catch {
                setMessage({ type: "err", text: "刷新失败" });
              }
            }}
          >
            从云端刷新
          </button>
          <button
            type="button"
            className="sgs-btn-secondary"
            onClick={async () => {
              if (
                !confirm(
                  "将本浏览器 localStorage 中的数据上传到云端，覆盖云端现有数据，是否继续？"
                )
              ) {
                return;
              }
              try {
                await uploadLocalToCloud();
                setMessage({ type: "ok", text: "已上传到云端" });
              } catch {
                setMessage({ type: "err", text: "上传失败，请检查写入密钥" });
              }
            }}
          >
            上传本地数据到云端
          </button>
        </div>
      )}

      <div className="sgs-card p-4 flex flex-col sm:flex-row flex-wrap gap-2">
        <button type="button" onClick={handleExport} className="sgs-btn-primary">
          导出 JSON
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="sgs-btn-secondary"
        >
          导入 JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImport(f);
            e.target.value = "";
          }}
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.type === "ok" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="space-y-3">
        {data.matches.length === 0 ? (
          <div className="sgs-card p-6 text-center text-sgs-muted">
            暂无对局记录
          </div>
        ) : (
          data.matches.map((m) => {
            const matchPoints = m.participants.reduce(
              (sum, p) => sum + getParticipantPoints(data, p),
              0
            );
            return (
              <article key={m.id} className="sgs-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <div>
                    <time className="text-sgs-gold-light font-medium">
                      {m.date}
                    </time>
                    <span className="mx-2 text-sgs-muted">·</span>
                    <span className="text-sm">{m.mode}</span>
                    <span className="ml-2 text-xs text-sgs-muted">
                      本局合计 {matchPoints} 分
                    </span>
                    {m.notes && (
                      <p className="text-sm text-sgs-muted mt-1">{m.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-3 shrink-0 self-start">
                    <Link
                      href={`/matches/${m.id}/edit`}
                      className="text-sm text-sgs-gold-light hover:text-sgs-gold"
                    >
                      编辑
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id, m.date)}
                      className="text-sm text-red-400/90 hover:text-red-300"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <ul className="space-y-1 text-sm">
                  {m.participants.map((p, i) => {
                    const pts = getParticipantPoints(data, p);
                    return (
                      <li
                        key={`${m.id}-${p.playerId}-${i}`}
                        className="flex flex-wrap gap-x-2 text-sgs-parchment/90 items-center"
                      >
                        <span className="font-medium">
                          {playerName(p.playerId)}
                        </span>
                        {p.identity && (
                          <span className="text-sgs-muted">{p.identity}</span>
                        )}
                        {p.general && <span>{p.general}</span>}
                        <span
                          className={
                            p.result === "win"
                              ? "text-green-400"
                              : "text-red-400/90"
                          }
                        >
                          {RESULT_LABELS[p.result]}
                        </span>
                        <span className="text-xs text-sgs-gold/80">
                          +{pts}分
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
