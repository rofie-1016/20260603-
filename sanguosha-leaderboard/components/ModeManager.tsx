"use client";

import { FormEvent, useState } from "react";
import { DEFAULT_GAME_MODES } from "@/lib/constants";
import type { AppData } from "@/lib/types";
import { addCustomMode, removeCustomMode } from "@/lib/settings";

interface Props {
  data: AppData;
  onPersist: (next: AppData) => void;
}

export function ModeManager({ data, onPersist }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      onPersist(addCustomMode(data, name));
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加失败");
    }
  };

  const handleRemove = (modeName: string) => {
    if (!confirm(`删除自定义模式「${modeName}」？已有对局中的模式名不会变。`)) {
      return;
    }
    onPersist(removeCustomMode(data, modeName));
  };

  return (
    <div className="sgs-card p-4 space-y-3">
      <h2 className="font-medium text-sgs-gold-light">自定义模式</h2>
      <p className="text-xs text-sgs-muted">
        内置：{DEFAULT_GAME_MODES.join("、")}。可添加工作室常用模式。
      </p>
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="如 斗地主、面杀"
          className="sgs-input flex-1"
          maxLength={20}
        />
        <button type="submit" className="sgs-btn-secondary shrink-0">
          添加模式
        </button>
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {data.settings.customModes.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {data.settings.customModes.map((m) => (
            <li
              key={m}
              className="flex items-center gap-1 rounded-full border border-sgs-border px-3 py-1 text-sm"
            >
              {m}
              <button
                type="button"
                onClick={() => handleRemove(m)}
                className="text-red-400/90 hover:text-red-300 ml-1"
                aria-label={`删除 ${m}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-sgs-muted">暂无自定义模式</p>
      )}
    </div>
  );
}
