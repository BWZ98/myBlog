# CLAUDE.md

给在本仓库工作的 Claude / AI 助手的工程指引。面向当前真实代码状态,不重复 README 已有的安装步骤。

## 项目概览

`myblog` 是一个 pnpm workspace monorepo 的个人博客系统,当前优先交付**只读阅读博客 MVP**:文章列表、详情、归档、关于、留言。技术栈 Vue 3 + Vite(前端)、NestJS(后端)、Prisma + PostgreSQL(数据)、Redis。

完整产品/技术方案见 `BLOG_SYSTEM_DESIGN.md`,根目录每个文件的作用见 `PROJECT_STRUCTURE.md`,安装与运行见 `README.md`。

## 仓库结构

```text
apps/
  web/     访客端 (Vue3+Vite, axios+pinia+vue-router) — 较完整
  admin/   管理后台 (Vue3+Element Plus) — 多为页面骨架,写操作未接通
  server/  后端 API (NestJS+Swagger) — 仅 health / posts 模块
packages/
  shared/  跨端共享类型与常量,导出为 @myblog/shared
prisma/    schema.prisma + migrations + seed.cjs
content/
  posts/   Markdown 文章源(frontmatter 元数据)
scripts/
  import-posts.cjs  读取 content/posts 写入数据库
docs/      设计文档(注意:被 .gitignore 忽略)
```

## 常用命令(均在仓库根运行)

```bash
pnpm dev              # 并行启动所有 app
pnpm dev:web          # 仅访客端 (5173)
pnpm dev:admin        # 仅后台 (5174)
pnpm dev:server       # 仅后端 (3000, Swagger 在 /docs)
pnpm build            # 递归构建所有 app
pnpm typecheck        # 递归类型检查
pnpm lint             # 递归 ESLint

pnpm posts:import     # 导入/更新 Markdown 文章到库
pnpm posts:sync       # 导入后,把无对应 md 的文章设为 ARCHIVED
pnpm posts:sync -- --delete-missing   # 物理删除缺失文章(谨慎)

pnpm prisma:generate  # 生成 Prisma Client
pnpm prisma:migrate   # 开发环境迁移
pnpm prisma:deploy    # 生产环境迁移
pnpm prisma:seed      # 初始化数据(内部调用 Markdown 导入)
```

子应用内也各有 `dev / build / typecheck / lint` 脚本(`pnpm --filter @myblog/<app> <script>`)。

## 架构与约定

- **Monorepo**:`pnpm-workspace.yaml` 纳入 `apps/*` 和 `packages/*`。跨端复用的类型/常量放 `packages/shared`,通过别名 `@myblog/shared` 引用(见 `tsconfig.base.json` 的 paths);不要在各 app 重复定义契约类型。
- **TypeScript**:所有子项目继承 `tsconfig.base.json`(strict、ESNext、Bundler 解析)。改动 base 配置后跑 `pnpm typecheck` 验证多个子项目。
- **后端 API 响应**:统一结构 `{ code, message, data }`,成功为 `code: 0, message: "ok"`(见 `apps/server/src/modules/posts/posts.controller.ts`)。新增接口请保持同一封装。
- **NestJS 模块**:按业务在 `apps/server/src/modules/<name>/` 下放 `*.controller.ts` / `*.service.ts` / `*.module.ts`,并在 `app.module.ts` 注册。数据库访问走 `PrismaModule` / `PrismaService`。控制器用 `@ApiTags` 标注以进 Swagger。
- **内容流**:文章源是 `content/posts/*.md`(gray-matter frontmatter + markdown-it 正文),经 `scripts/import-posts.cjs` 写库。优先改 Markdown 再导入,而非直接改库。
- **数据模型**:`prisma/schema.prisma` 已建 User/Post/Category/Tag/PostTag/Comment/GuestbookMessage/Like/RefreshToken/EmailVerificationCode/Asset/SiteSetting。字段用 `@map` 映射 snake_case 列名。改模型后必须生成迁移。

## 环境变量

复制 `.env.example` 为 `.env`。关键项:`DATABASE_URL`、`PORT`、`REDIS_URL`、`CORS_ORIGIN`(前后端分域时填前端域名,逗号分隔)、`JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`(启用后台登录前必须换强随机值)、`MAIL_FROM`。`.env` 含敏感信息,不提交。

## 当前实现状态(动手前先确认)

- 前台 `apps/web`:阅读相关页面基本可用。
- 后端 `apps/server`:**仅** health、posts 两个模块。分类/标签/评论/留言/鉴权等 API 尚未实现。
- 后台 `apps/admin`:页面齐全但多为壳,登录/JWT 鉴权与写操作未接通。

新增功能时,先看对应模块是否已存在,避免假设设计文档里的能力已落地。

## 提交与代码风格

- 格式遵循 `.editorconfig` + `.prettierrc`,检查走 `eslint.config.mjs`。提交前跑 `pnpm lint` 和 `pnpm typecheck`。
- 历史提交信息用中文 + 约定式前缀(如 `feat:`、`chore:`)。
- `node_modules`、`dist`、`.env`、日志、上传目录已在 `.gitignore` 中。注意 `docs/` 也被忽略。
