"use client";

interface Props {
  identity: string;
  general: string;
  identityOptions: string[];
  generalOptions: string[];
  onIdentityChange: (v: string) => void;
  onGeneralChange: (v: string) => void;
}

export function LeaderboardFiltersBar({
  identity,
  general,
  identityOptions,
  generalOptions,
  onIdentityChange,
  onGeneralChange,
}: Props) {
  const active = identity || general;

  return (
    <div className="sgs-card p-4 grid gap-3 sm:grid-cols-2">
      <label className="text-sm">
        <span className="sgs-label">按身份筛选</span>
        <select
          value={identity}
          onChange={(e) => onIdentityChange(e.target.value)}
          className="sgs-input mt-1"
        >
          <option value="">全部身份</option>
          {identityOptions.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="sgs-label">按武将筛选</span>
        <select
          value={general}
          onChange={(e) => onGeneralChange(e.target.value)}
          className="sgs-input mt-1"
        >
          <option value="">全部武将</option>
          {generalOptions.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </label>
      {active && (
        <p className="sm:col-span-2 text-xs text-sgs-gold/90">
          当前仅统计
          {identity ? ` 身份「${identity}」` : ""}
          {general ? ` 武将「${general}」` : ""}
          的对局
        </p>
      )}
    </div>
  );
}
