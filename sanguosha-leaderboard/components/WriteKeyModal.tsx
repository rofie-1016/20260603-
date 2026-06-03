"use client";

import { FormEvent, useState } from "react";

interface Props {
  open: boolean;
  onSubmit: (key: string) => Promise<void>;
  onCancel: () => void;
}

export function WriteKeyModal({ open, onSubmit, onCancel }: Props) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit(key.trim());
      setKey("");
    } catch {
      setError("密钥错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div className="sgs-card p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-medium text-sgs-gold-light">输入写入密钥</h2>
        <p className="text-sm text-sgs-muted">
          修改数据需要工作室写入密码（由管理员在环境变量中配置）。
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="写入密钥"
            className="sgs-input"
            autoFocus
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !key.trim()}
              className="sgs-btn-primary flex-1"
            >
              {loading ? "验证中…" : "确认"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="sgs-btn-secondary flex-1"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
