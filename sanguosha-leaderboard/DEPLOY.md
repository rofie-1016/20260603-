# 部署清单（给 Vercel 用）

在 Vercel → Project → Settings → Environment Variables 添加：

| 名称 | 值 |
|------|-----|
| NEXT_PUBLIC_DATA_SOURCE | supabase |
| SUPABASE_URL | https://tufentygzkjhsktyvwxw.supabase.co |
| SUPABASE_SERVICE_ROLE_KEY | （见本地 .env.local，勿公开） |
| STUDIO_WRITE_KEY | sgs2024 |

## GitHub 上传步骤（安装 Git 后）

```cmd
cd /d "C:\Users\ytt\Desktop\三国杀排行版"
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/rofie-1016/sanguosha-leaderboard.git
git push -u origin main
```

先在 GitHub 创建仓库名：`sanguosha-leaderboard`（Public，不要勾选 README）

## 不要上传的文件

- `.env.local`（已在 .gitignore）
- `node_modules`、`.next`
