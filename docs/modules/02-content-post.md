# 文章内容模块设计

## 1. 模块目标

文章内容模块负责博客的核心内容生产和阅读体验，包括文章、分类、标签、归档、搜索、阅读计数和内容发布状态。

## 2. 模块结构

```mermaid
flowchart TB
  subgraph PostModule["Posts Module"]
    PublicPostApi["访客文章接口"]
    AdminPostApi["后台文章接口"]
    PostService["文章服务"]
    PublishService["发布服务"]
    RenderService["Markdown 渲染服务"]
    ViewService["阅读计数服务"]
  end

  subgraph Taxonomy["分类标签模块"]
    CategoryService["分类服务"]
    TagService["标签服务"]
  end

  DB["posts / categories / tags / post_tags"]
  Redis["Redis 计数与缓存"]
  Search["全文搜索索引 可选"]

  PublicPostApi --> PostService
  AdminPostApi --> PostService
  AdminPostApi --> PublishService
  PostService --> RenderService
  PostService --> CategoryService
  PostService --> TagService
  ViewService --> Redis
  PostService --> DB
  CategoryService --> DB
  TagService --> DB
  PostService --> Search
```

## 3. 核心职责

### 3.1 文章服务

- 创建文章。
- 编辑文章。
- 查询文章列表。
- 查询文章详情。
- 软删除文章。
- 管理文章分类、标签关联。

### 3.2 发布服务

- 草稿发布。
- 已发布文章下线。
- 私密文章控制。
- 发布时间维护。
- 发布状态校验。

### 3.3 Markdown 渲染服务

- Markdown 转 HTML。
- 代码高亮。
- 目录生成。
- HTML 清洗。
- 摘要生成，可选。

### 3.4 阅读计数服务

- 记录文章阅读量。
- 防止短时间重复计数。
- 可用 Redis 做短期去重。
- 定期或实时回写数据库。

## 4. 内容状态机

```mermaid
stateDiagram-v2
  [*] --> DRAFT
  DRAFT --> PUBLISHED: publish
  PUBLISHED --> ARCHIVED: archive
  ARCHIVED --> PUBLISHED: republish
  PUBLISHED --> DRAFT: unpublishToDraft
  DRAFT --> DELETED: softDelete
  ARCHIVED --> DELETED: softDelete
  DELETED --> [*]
```

设计原因：

- `DRAFT` 用于未完成内容。
- `PUBLISHED` 对访客可见。
- `ARCHIVED` 表示下线但保留记录。
- `deleted_at` 做软删除，避免误删和关系数据断裂。

## 5. 文章创建与发布流程

```mermaid
sequenceDiagram
  participant A as 管理员
  participant Admin as 管理后台
  participant API as AdminPostController
  participant Post as PostService
  participant Render as RenderService
  participant DB as PostgreSQL

  A->>Admin: 编辑标题、摘要、正文、分类、标签
  Admin->>API: POST /api/admin/posts
  API->>Post: createDraft(dto)
  Post->>Render: renderMarkdown(contentMd)
  Render-->>Post: contentHtml / toc
  Post->>DB: 写入 posts 和 post_tags
  DB-->>Post: 文章 ID
  Post-->>API: PostDetail
  API-->>Admin: 保存成功

  A->>Admin: 点击发布
  Admin->>API: POST /api/admin/posts/:id/publish
  API->>Post: publish(id)
  Post->>DB: status=PUBLISHED, published_at=now()
  API-->>Admin: 发布成功
```

## 6. 访客查询设计

访客端只查询满足以下条件的文章：

- `status = PUBLISHED`
- `visibility = PUBLIC`
- `deleted_at IS NULL`

列表接口默认按 `is_top DESC, published_at DESC` 排序。

```mermaid
flowchart LR
  Query["文章列表查询"] --> Filter["状态/可见性/软删除过滤"]
  Filter --> Sort["置顶 + 发布时间排序"]
  Sort --> Page["分页"]
  Page --> DTO["列表 DTO"]
```

设计原因：

- 后台和前台查询必须分开，避免草稿泄露。
- 列表 DTO 不返回完整正文，减少带宽。
- 详情接口按 `slug` 查询，更适合 SEO 和可读 URL。

## 7. 分类与标签

分类和标签职责不同：

- 分类是主线结构，一篇文章通常只有一个分类。
- 标签是横向索引，一篇文章可以有多个标签。

```mermaid
erDiagram
  POSTS }o--|| CATEGORIES : belongs_to
  POSTS ||--o{ POST_TAGS : has
  TAGS ||--o{ POST_TAGS : has
```

设计原因：

- 分类用于站点导航和归档。
- 标签用于主题聚合。
- `post_count` 冗余字段提升列表展示性能，但需要在写入时维护。

## 8. 搜索设计

MVP 搜索：

- PostgreSQL `ILIKE` 或 MySQL `LIKE`。
- 查询标题、摘要、正文。
- 适合文章数量少的阶段。

增强搜索：

- PostgreSQL `tsvector`。
- Meilisearch。
- Elasticsearch。

```mermaid
flowchart TB
  Keyword["关键词"] --> Basic["MVP: DB LIKE"]
  Keyword --> Advanced["增强: Search Engine"]
  Basic --> Result["文章列表结果"]
  Advanced --> Result
```

## 9. 接口草案

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/posts` | 访客文章列表 |
| `GET` | `/api/posts/:slug` | 访客文章详情 |
| `GET` | `/api/categories` | 分类列表 |
| `GET` | `/api/tags` | 标签列表 |
| `GET` | `/api/archives` | 归档 |
| `POST` | `/api/admin/posts` | 创建文章 |
| `PATCH` | `/api/admin/posts/:id` | 更新文章 |
| `POST` | `/api/admin/posts/:id/publish` | 发布 |
| `POST` | `/api/admin/posts/:id/archive` | 下线 |
| `DELETE` | `/api/admin/posts/:id` | 删除 |

## 10. 设计取舍

### 10.1 为什么保存 Markdown 原文

Markdown 是博主编辑的真实源数据，便于后续重新渲染、迁移渲染器、导出文章。HTML 可以作为缓存字段，但不能替代 Markdown 原文。

### 10.2 为什么使用 slug

`slug` 比数字 ID 更适合分享和 SEO。后台需要校验唯一性，并支持标题自动生成 slug。

### 10.3 为什么正文 HTML 服务端清洗

访客端使用 `v-html` 会有 XSS 风险。服务端统一清洗，能让前端只消费可信 HTML。

## 11. 后续演进

- Nuxt 3 SSR/SSG。
- RSS。
- sitemap.xml 自动生成。
- 文章版本历史。
- 定时发布。
- 全文搜索。
- 阅读数据统计。
- 图片资源自动压缩和 CDN。
