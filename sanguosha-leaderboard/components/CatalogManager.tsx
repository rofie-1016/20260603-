"use client";

import { FormEvent, useState } from "react";
import { DEFAULT_IDENTITIES } from "@/lib/constants";
import { DEFAULT_GENERALS_COUNT } from "@/lib/default-generals";
import type { AppData } from "@/lib/types";
import {
  addCustomGeneral,
  addCustomIdentity,
  getGenerals,
  removeCustomGeneral,
  removeCustomIdentity,
} from "@/lib/settings";

interface Props {
  data: AppData;
  onPersist: (next: AppData) => void;
}

export function CatalogManager({ data, onPersist }: Props) {
  const [identityName, setIdentityName] = useState("");
  const [generalName, setGeneralName] = useState("");
  const [error, setError] = useState("");

  const handleAddIdentity = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      onPersist(addCustomIdentity(data, identityName));
      setIdentityName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加失败");
    }
  };

  const handleAddGeneral = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      onPersist(addCustomGeneral(data, generalName));
      setGeneralName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加失败");
    }
  };

  const totalGenerals = getGenerals(data).length;

  return (
    <div className="sgs-card p-4 space-y-4">
      <h2 className="font-medium text-sgs-gold-light">身份与武将库</h2>
      <p className="text-xs text-sgs-muted">
        录入对局时从此列表选择。内置身份：{DEFAULT_IDENTITIES.join("、")}
      </p>
      <p className="text-xs text-sgs-muted">
        内置武将 {DEFAULT_GENERALS_COUNT} 名（录入时可搜索筛选），当前可选共{" "}
        {totalGenerals} 名。
      </p>

      <div>
        <p className="sgs-label">添加自定义身份</p>
        <form
          onSubmit={handleAddIdentity}
          className="flex flex-col sm:flex-row gap-2 mt-1"
        >
          <input
            type="text"
            value={identityName}
            onChange={(e) => setIdentityName(e.target.value)}
            placeholder="如 野心家、龙势力"
            className="sgs-input flex-1"
            maxLength={16}
          />
          <button type="submit" className="sgs-btn-secondary shrink-0">
            添加身份
          </button>
        </form>
        {data.settings.customIdentities.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-2">
            {data.settings.customIdentities.map((id) => (
              <li
                key={id}
                className="flex items-center gap-1 rounded-full border border-sgs-border px-3 py-1 text-sm"
              >
                {id}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`删除身份「${id}」？`)) {
                      try {
                        onPersist(removeCustomIdentity(data, id));
                      } catch (err) {
                        setError(
                          err instanceof Error ? err.message : "删除失败"
                        );
                      }
                    }
                  }}
                  className="text-red-400/90 hover:text-red-300 ml-1"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="sgs-label">添加自定义武将</p>
        <form
          onSubmit={handleAddGeneral}
          className="flex flex-col sm:flex-row gap-2 mt-1"
        >
          <input
            type="text"
            value={generalName}
            onChange={(e) => setGeneralName(e.target.value)}
            placeholder="库中没有的武将名"
            className="sgs-input flex-1"
            maxLength={24}
          />
          <button type="submit" className="sgs-btn-secondary shrink-0">
            添加武将
          </button>
        </form>
        {data.settings.customGenerals.length > 0 ? (
          <ul className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
            {data.settings.customGenerals.map((g) => (
              <li
                key={g}
                className="flex items-center gap-1 rounded-full border border-sgs-border px-3 py-1 text-sm"
              >
                {g}
                <button
                  type="button"
                  onClick={() => {
                    try {
                      onPersist(removeCustomGeneral(data, g));
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "删除失败");
                    }
                  }}
                  className="text-red-400/90 hover:text-red-300 ml-1"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-sgs-muted mt-2">暂无自定义武将</p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
