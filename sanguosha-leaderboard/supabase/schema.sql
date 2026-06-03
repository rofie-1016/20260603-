-- 在 Supabase Dashboard → SQL Editor 中执行此脚本

create table if not exists public.studio_data (
  id text primary key default 'main',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 仅服务端（Service Role）访问；不启用 anon 直连
alter table public.studio_data enable row level security;

-- 不创建 anon 策略，客户端通过 Next.js API + Service Role 读写

insert into public.studio_data (id, payload)
values ('main', '{"players":[],"matches":[],"settings":null}'::jsonb)
on conflict (id) do nothing;

comment on table public.studio_data is '三国杀工作室共用数据（单行 JSON）';
