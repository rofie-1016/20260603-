# 三国杀工作室 · 胜率排行榜

Next.js + TypeScript + Tailwind CSS。支持 **本地模式** 与 **Supabase 云端共用**。

## 安装依赖

```bash
npm install
```

## 本地运行（仅本机数据）

不配置 `.env.local` 时，数据保存在浏览器 localStorage。

```bash
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 工作室云端共用（Supabase）

### 1. 创建 Supabase 项目

1. 打开 [supabase.com](https://supabase.com) 注册并 **New Project**
2. 进入 **SQL Editor**，粘贴并执行 [`supabase/schema.sql`](supabase/schema.sql)

### 2. 获取密钥

在 Supabase → **Project Settings → API**：

- **Project URL** → `SUPABASE_URL`
- **service_role**（secret）→ `SUPABASE_SERVICE_ROLE_KEY`（仅服务端，切勿泄露到前端）

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
NEXT_PUBLIC_DATA_SOURCE=supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STUDIO_WRITE_KEY=你们工作室的写入密码
```

- `STUDIO_WRITE_KEY` 可选；设置后，修改数据需输入该密码（浏览可无需密码）
- 留空 `STUDIO_WRITE_KEY` 则任何人可写入（不推荐公开部署时使用）

### 4. 部署到 Vercel（联网访问）

1. 代码推送到 GitHub
2. [vercel.com](https://vercel.com) 导入项目
3. 在 Vercel **Environment Variables** 填入与 `.env.local` 相同的变量
4. Deploy 完成后将网址发给工作室成员

### 5. 迁移已有本地数据

云端模式开启后，在 **数据** 页点击 **「上传本地数据到云端」**。

---

## 其他命令

```bash
npm run build      # 生产构建
npm run dev:watch  # 开发（不清缓存，更快）
npm run generals   # 重新生成武将库
```

## 目录说明

| 路径 | 说明 |
|------|------|
| `lib/storage.ts` | 本地读写 + 数据规范化 |
| `lib/cloud-client.ts` | 浏览器调用 `/api/data` |
| `lib/supabase/server.ts` | 服务端 Supabase 读写 |
| `app/api/data/route.ts` | 云端 GET/PUT API |
| `supabase/schema.sql` | 数据库建表脚本 |
