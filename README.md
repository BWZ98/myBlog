# MyBlog

个人博客系统工程骨架，采用 Vue 3 + Vite + NestJS + Prisma + PostgreSQL + Redis。

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
pnpm dev
```

默认端口：

- 访客端：http://localhost:5173
- 管理后台：http://localhost:5174
- 后端 API：http://localhost:3000
- Swagger：http://localhost:3000/docs

详细方案见 `BLOG_SYSTEM_DESIGN.md`。
