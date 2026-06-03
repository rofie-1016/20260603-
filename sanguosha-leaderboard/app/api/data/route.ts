import { NextResponse } from "next/server";
import {
  isServerCloudConfigured,
  loadCloudData,
  saveCloudData,
  validateWriteKey,
} from "@/lib/supabase/server";
import { normalizeData } from "@/lib/storage";
import type { AppData } from "@/lib/types";

export async function GET() {
  if (!isServerCloudConfigured()) {
    return NextResponse.json(
      { error: "服务端未配置 Supabase 环境变量" },
      { status: 503 }
    );
  }
  try {
    const { data, updatedAt } = await loadCloudData();
    return NextResponse.json({ data, updatedAt });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "读取失败" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!isServerCloudConfigured()) {
    return NextResponse.json(
      { error: "服务端未配置 Supabase 环境变量" },
      { status: 503 }
    );
  }
  if (!validateWriteKey(request.headers.get("x-studio-key"))) {
    return NextResponse.json({ error: "写入密钥不正确" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as Partial<AppData>;
    const normalized = normalizeData(body);
    const updatedAt = await saveCloudData(normalized);
    return NextResponse.json({ ok: true, updatedAt });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "保存失败" },
      { status: 500 }
    );
  }
}
