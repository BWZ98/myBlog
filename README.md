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
content/
  posts/    Markdown 文章源文件
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

## Markdown 文章导入

文章放在 `content/posts/*.md`，每个文件使用 frontmatter 描述元数据：

```md
---
title: 文章标题
slug: article-slug
summary: 文章摘要
publishedAt: 2026-06-01T09:00:00.000Z
category:
  name: 工程
  slug: engineering
tags:
  - name: Vue
    slug: vue
status: PUBLISHED
visibility: PUBLIC
allowComment: false
---

## 正文标题

这里写 Markdown 正文。
```

导入或更新文章：

```bash
pnpm posts:import
```

全量同步文章：

```bash
pnpm posts:sync
```

`posts:sync` 会先导入或更新所有 Markdown 文章，再把数据库中没有对应 Markdown 文件的文章设为 `ARCHIVED`，使其不再出现在前台。

如果确认要物理删除这些缺失文章：

```bash
pnpm posts:sync -- --delete-missing
```

`pnpm prisma:seed` 也会调用同一套 Markdown 导入逻辑，适合初始化数据库时使用。

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
