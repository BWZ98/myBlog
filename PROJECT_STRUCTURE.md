# 项目根目录结构说明

这份文档从工程维护角度说明根目录下每个主要文件和文件夹的作用。它用于帮助后续开发、部署、排障和协作时快速判断“这个东西属于哪一层、能不能改、要不要提交”。

## 目录

### `.dev-logs/`

本地开发时保存服务启动日志的目录，例如前端、后台管理端、后端 API 的 stdout/stderr 日志。

工程意义：

- 方便排查本地 `pnpm dev` 或后台启动进程的问题。
- 属于本机运行痕迹，不是源码。
- 通常不需要提交到 Git。

### `.git/`

Git 仓库元数据目录，保存提交历史、分支、索引等信息。

工程意义：

- 这是版本控制系统的内部目录。
- 不应该手动编辑。
- 不会作为普通项目文件提交。

### `apps/`

应用层目录，放多个可独立运行或构建的应用。

当前包含：

- `apps/web/`：访客端博客前台，负责首页、文章详情、归档、关于页等阅读体验。
- `apps/admin/`：管理后台，当前仍偏骨架，后续用于文章管理、评论审核、站点设置等。
- `apps/server/`：NestJS 后端 API，负责健康检查、文章接口、数据库访问等服务端能力。

工程意义：

- 这是 monorepo 的“产品应用”层。
- 每个子应用有自己的 `package.json`、构建配置和源码。
- 适合按业务边界拆分前台、后台和 API。

### `content/`

内容源文件目录，目前用于存放 Markdown 文章。

当前包含：

- `content/posts/`：博客文章 Markdown 文件。每篇文章通过 frontmatter 定义标题、slug、摘要、发布时间、分类、标签等元数据。

工程意义：

- 这是当前博客的内容源头。
- 新增或修改文章后，运行 `pnpm posts:import` 将 Markdown 导入数据库。
- 相比直接改数据库，Markdown 文件更容易版本管理和审阅。

### `docs/`

项目设计文档目录，包含模块设计、基础设施、数据模型、前端架构等说明。

工程意义：

- 用于保存长期设计和开发决策。
- 适合放详细方案、接口规划、部署说明、模块拆解。
- 注意当前 `.gitignore` 里包含 `docs`，如果希望提交这些文档，需要调整忽略规则。

### `node_modules/`

依赖安装目录，由 pnpm 根据 `package.json` 和 `pnpm-lock.yaml` 生成。

工程意义：

- 本地开发和构建时使用。
- 体积大、可再生成，不应该提交到 Git。
- 如果依赖异常，通常可以删除后重新运行 `pnpm install`。

### `packages/`

共享包目录，放跨应用复用的代码。

当前包含：

- `packages/shared/`：共享类型、枚举和常量，例如 API 响应结构、文章列表类型等。

工程意义：

- 避免 web、admin、server 各自复制类型定义。
- 适合放稳定的跨端契约。
- 不适合放某个应用独有的业务逻辑。

### `prisma/`

数据库模型和数据库初始化相关目录。

当前包含：

- `schema.prisma`：Prisma 数据模型，定义用户、文章、分类、标签、评论、留言等表结构。
- `migrations/`：数据库迁移 SQL，用于把数据库结构升级到指定版本。
- `seed.cjs`：数据库初始化脚本，目前会调用 Markdown 导入逻辑。

工程意义：

- 这是数据库结构的来源。
- 修改数据模型后需要生成迁移。
- 新环境初始化时通常执行 `pnpm prisma:generate`、`pnpm prisma:migrate` 或 `pnpm prisma:deploy`、`pnpm prisma:seed`。

### `scripts/`

工程脚本目录，用于放项目级自动化脚本。

当前包含：

- `scripts/import-posts.cjs`：读取 `content/posts/*.md`，解析 frontmatter 和正文，并写入数据库。

工程意义：

- 放不属于单个应用、但服务整个仓库的脚本。
- 适合承载导入、迁移辅助、检查、发布前处理等任务。

## 文件

### `.editorconfig`

编辑器格式约定文件。

工程意义：

- 统一缩进、换行、字符集等基础格式。
- 帮助不同编辑器保持一致的代码风格。

### `.env`

本地环境变量文件，包含数据库连接、端口、密钥等运行配置。

工程意义：

- 当前机器实际运行时读取它。
- 可能包含敏感信息，不应该提交到 Git。
- 如果环境变量变了，重启服务后才会生效。

### `.env.example`

环境变量示例文件。

工程意义：

- 给新开发者或新服务器说明需要哪些环境变量。
- 不应该放真实密码和密钥。
- 建议保留在 Git 中，因为 README 的初始化步骤依赖它生成 `.env`。

### `.gitignore`

Git 忽略规则。

工程意义：

- 控制哪些文件不进入版本库。
- 当前忽略了 `node_modules`、`dist`、`.env`、日志、上传目录等本地或生成文件。
- 修改它会影响后续 `git status` 和提交范围，需要谨慎。

### `.prettierrc`

Prettier 格式化配置。

工程意义：

- 定义统一的代码格式规则。
- 与 ESLint 配合减少无意义的格式差异。

### `BLOG_SYSTEM_DESIGN.md`

博客系统总体设计文档。

工程意义：

- 记录完整产品和技术方案。
- 当前实现是从这份设计中先截取“只读博客 MVP”落地。
- 后续做登录、后台、评论、留言时可以继续参考。

### `docker-compose.yml`

本地基础设施编排文件。

工程意义：

- 用 Docker 一键启动 PostgreSQL 和 Redis。
- 本地初始化数据库时先运行 `docker compose up -d postgres redis`。
- 适合开发环境，不等同于完整生产部署方案。

### `eslint.config.mjs`

ESLint 配置文件。

工程意义：

- 定义 TypeScript、Vue 等源码检查规则。
- `pnpm lint` 会读取它。
- 用于提前发现语法、风格和潜在质量问题。

### `package.json`

根 package 配置。

工程意义：

- 定义 monorepo 根项目的脚本、依赖和 Prisma seed 配置。
- 常用脚本包括 `pnpm dev`、`pnpm build`、`pnpm lint`、`pnpm typecheck`、`pnpm posts:import`、`pnpm prisma:seed`。
- 根依赖适合放项目级脚本需要的包，例如 Markdown 导入工具。

### `pnpm-lock.yaml`

pnpm 锁文件。

工程意义：

- 锁定依赖版本，保证不同机器安装结果一致。
- 修改依赖后会自动更新。
- 应该提交到 Git。

### `pnpm-workspace.yaml`

pnpm workspace 配置。

工程意义：

- 告诉 pnpm 哪些目录属于同一个 monorepo。
- 当前主要把 `apps/*` 和 `packages/*` 纳入工作区。
- 根目录脚本通过它批量运行各子项目命令。

### `README.md`

项目入口说明文档。

工程意义：

- 给开发者最快了解项目如何安装、启动、导入文章、部署初始化。
- 应保持简洁，详细设计放到 `BLOG_SYSTEM_DESIGN.md` 或 `docs/`。

### `tsconfig.base.json`

TypeScript 基础配置。

工程意义：

- 给各应用和共享包继承统一的 TypeScript 编译选项。
- 定义了路径别名，例如 `@myblog/shared`。
- 修改它会影响多个子项目，需要跑 `pnpm typecheck` 验证。
