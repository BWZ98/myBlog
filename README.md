# MyBlog

个人博客系统，采用 Vue 3 + Vite + NestJS + Prisma + PostgreSQL。当前优先交付只读可阅读博客：文章列表、文章详情、归档和关于页。

## 目录

```text
apps/
  web/      访客端
  admin/    管理后台
  server/   后端 API
packages/
  shared/   共享类型与常量
prisma/     数据库模型
docs/       项目文档
```

## 快速开始

```bash
corepack enable
pnpm install
cp .env.example .env
docker compose up -d postgres redis
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

默认端口：

- 访客端：http://localhost:5173
- 管理后台：http://localhost:5174
- 后端 API：http://localhost:3000
- Swagger：http://localhost:3000/docs

## 生产初始化

```bash
pnpm install --frozen-lockfile
pnpm prisma:generate
pnpm prisma:deploy
pnpm prisma:seed
pnpm build
pnpm --filter @myblog/server start
```

生产环境至少需要配置：

- `DATABASE_URL`
- `PORT`
- `CORS_ORIGIN`：前后端分域时填写前端域名，多个域名用英文逗号分隔。
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`：后续启用后台登录前必须换成强随机值。

详细方案见 `BLOG_SYSTEM_DESIGN.md`。
