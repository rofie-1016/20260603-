"use client";

import { FormEvent, useState } from "react";
import { Loading } from "@/components/Loading";
import { useAppDataStore } from "@/components/AppDataProvider";
import { addPlayer, removePlayer } from "@/lib/storage";

export default function PlayersPage() {
  const { data, ready, persist } = useAppDataStore();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  if (!ready || !data) return <Loading />;

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      persist(addPlayer(data, name));
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加失败");
    }
  };

  const handleDelete = (id: string, playerName: string) => {
    if (!confirm(`确定删除玩家「${playerName}」？相关对局记录会移除该玩家条目。`)) {
      return;
    }
    persist(removePlayer(data, id));
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-sgs-gold-light mb-1">玩家管理</h1>
        <p className="text-sm text-sgs-muted">玩家名不可重复</p>
      </section>

      <form onSubmit={handleAdd} className="sgs-card p-4 space-y-3">
        <label className="sgs-label" htmlFor="player-name">
          添加玩家
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="player-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入玩家昵称"
            className="sgs-input flex-1"
            maxLength={32}
          />
          <button type="submit" className="sgs-btn-primary shrink-0">
            添加
          </button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      <div className="sgs-card divide-y divide-sgs-border">
        {data.players.length === 0 ? (
          <p className="p-6 text-center text-sgs-muted">还没有玩家</p>
        ) : (
          data.players.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="font-medium">{p.name}</span>
              <button
                type="button"
                onClick={() => handleDelete(p.id, p.name)}
                className="text-sm text-red-400/90 hover:text-red-300"
              >
                删除
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
