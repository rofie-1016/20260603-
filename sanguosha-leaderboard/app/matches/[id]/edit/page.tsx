"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MatchForm } from "@/components/MatchForm";
import { Loading } from "@/components/Loading";
import { useAppDataStore } from "@/components/AppDataProvider";
import { getGameModes } from "@/lib/settings";
import { getMatch, updateMatch } from "@/lib/storage";

export default function EditMatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const { data, ready, persist } = useAppDataStore();

  if (!ready || !data) return <Loading />;

  const match = getMatch(data, matchId);

  if (!match) {
    return (
      <div className="sgs-card p-6 text-center space-y-4">
        <p className="text-sgs-muted">对局不存在或已被删除</p>
        <Link href="/data" className="sgs-btn-primary inline-flex">
          返回数据页
        </Link>
      </div>
    );
  }

  const modes = getGameModes(data);
  const modeOptions = modes.includes(match.mode)
    ? modes
    : [match.mode, ...modes];

  return (
    <MatchForm
      data={data}
      players={data.players}
      modes={modeOptions}
      initial={{
        date: match.date,
        mode: match.mode,
        notes: match.notes,
        participants: match.participants,
      }}
      title="编辑对局"
      submitLabel="保存修改"
      cancelHref="/data"
      onSubmit={(values) => {
        try {
          persist(updateMatch(data, matchId, values));
          router.push("/data");
        } catch {
          alert("保存失败");
        }
      }}
    />
  );
}
