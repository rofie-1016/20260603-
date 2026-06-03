"use client";

interface Props {
  cloud: boolean;
  syncing: boolean;
  error: string | null;
}

export function CloudStatus({ cloud, syncing, error }: Props) {
  if (!cloud) {
    return (
      <p className="text-xs text-sgs-muted px-4 pb-2 -mt-2">
        本地模式 · 数据仅保存在本浏览器
      </p>
    );
  }

  return (
    <div className="px-4 pb-2 -mt-2 text-xs">
      {error ? (
        <p className="text-amber-400/90">{error}</p>
      ) : (
        <p className="text-green-400/80">
          {syncing ? "云端同步中…" : "云端已连接 · 工作室共用数据"}
        </p>
      )}
    </div>
  );
}
