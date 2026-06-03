"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MatchForm } from "@/components/MatchForm";
import { Loading } from "@/components/Loading";
import { useAppDataStore } from "@/components/AppDataProvider";
import { getGameModes } from "@/lib/settings";
import { addMatch } from "@/lib/storage";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function NewMatchPage() {
  const router = useRouter();
  const { data, ready, persist } = useAppDataStore();

  if (!ready || !data) return <Loading />;

  if (data.players.length === 0) {
    return (
      <div className="sgs-card p-6 text-center space-y-4">
        <p className="text-sgs-muted">请先添加玩家再录入对局</p>
        <Link href="/players" className="sgs-btn-primary inline-flex">
          去添加玩家
        </Link>
      </div>
    );
  }

  const modes = getGameModes(data);

  return (
    <MatchForm
      data={data}
      players={data.players}
      modes={modes}
      initial={{
        date: todayISO(),
        mode: modes[0] ?? "",
        notes: "",
        participants: [],
      }}
      title="录入对局"
      submitLabel="提交保存"
      cancelHref="/"
      onSubmit={(values) => {
        persist(addMatch(data, values));
        router.push("/data");
      }}
    />
  );
}
