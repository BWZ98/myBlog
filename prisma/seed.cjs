const { PrismaClient, PostStatus, UserRole, UserStatus, Visibility } = require("@prisma/client");

const prisma = new PrismaClient();

const posts = [
  {
    title: "先把博客做成能读的样子",
    slug: "ship-readable-blog-first",
    summary: "第一版博客不急着做复杂互动，先把文章发布、阅读和归档链路打通。",
    categorySlug: "engineering",
    tagSlugs: ["launch", "writing"],
    publishedAt: new Date("2026-06-01T09:00:00.000Z"),
    contentMd: `## 为什么先做只读版

完整博客系统可以很大，但上线的第一步应该足够小：读者打开首页，能看到文章；点进详情，能顺畅读完；回到归档，能按时间找到旧内容。

## 第一阶段保留什么

- 已发布文章列表
- 文章详情页
- 按月份归档
- 关于页

## 暂时不做什么

评论、留言、访客账号和完整后台都可以后置。内容稳定之后，再逐步补上互动能力，会比一开始铺太大更稳。`,
    contentHtml: `<h2>为什么先做只读版</h2>
<p>完整博客系统可以很大，但上线的第一步应该足够小：读者打开首页，能看到文章；点进详情，能顺畅读完；回到归档，能按时间找到旧内容。</p>
<h2>第一阶段保留什么</h2>
<ul>
  <li>已发布文章列表</li>
  <li>文章详情页</li>
  <li>按月份归档</li>
  <li>关于页</li>
</ul>
<h2>暂时不做什么</h2>
<p>评论、留言、访客账号和完整后台都可以后置。内容稳定之后，再逐步补上互动能力，会比一开始铺太大更稳。</p>`
  },
  {
    title: "这套博客骨架的技术栈",
    slug: "vue-nest-prisma-blog-stack",
    summary: "Vue 负责阅读体验，NestJS 提供 API，Prisma 管住数据模型，先用最少模块跑通发布链路。",
    categorySlug: "engineering",
    tagSlugs: ["vue", "nestjs"],
    publishedAt: new Date("2026-05-28T09:00:00.000Z"),
    contentMd: `## 分层

当前项目拆成三个应用：访客端、管理端和后端 API。第一版只读博客主要依赖访客端和后端 API。

## 数据

Prisma schema 已经覆盖文章、分类、标签、评论、留言和用户。MVP 只读取已发布文章，避免一开始就把权限和审核流程全部拉进来。

## 下一步

等内容发布稳定，再补管理后台登录、文章编辑和评论审核。`,
    contentHtml: `<h2>分层</h2>
<p>当前项目拆成三个应用：访客端、管理端和后端 API。第一版只读博客主要依赖访客端和后端 API。</p>
<h2>数据</h2>
<p>Prisma schema 已经覆盖文章、分类、标签、评论、留言和用户。MVP 只读取已发布文章，避免一开始就把权限和审核流程全部拉进来。</p>
<h2>下一步</h2>
<p>等内容发布稳定，再补管理后台登录、文章编辑和评论审核。</p>`
  },
  {
    title: "个人知识库应该慢慢长出来",
    slug: "personal-knowledge-base-notes",
    summary: "博客不是一次性装修，而是反复使用后留下的路径。先记录，再筛选，最后沉淀结构。",
    categorySlug: "notes",
    tagSlugs: ["writing"],
    publishedAt: new Date("2026-05-16T09:00:00.000Z"),
    contentMd: `## 从记录开始

很多知识管理系统失败，是因为一开始就想把分类设计得过于精确。更实用的方式是先写下来，让真实内容反过来塑造结构。

## 保持轻量

一篇文章只需要标题、摘要、正文、发布时间和少量标签。够读，够找，就已经能产生价值。`,
    contentHtml: `<h2>从记录开始</h2>
<p>很多知识管理系统失败，是因为一开始就想把分类设计得过于精确。更实用的方式是先写下来，让真实内容反过来塑造结构。</p>
<h2>保持轻量</h2>
<p>一篇文章只需要标题、摘要、正文、发布时间和少量标签。够读，够找，就已经能产生价值。</p>`
  }
];

async function main() {
  const author = await prisma.user.upsert({
    where: {
      email: "author@example.com"
    },
    update: {
      nickname: "博客作者",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    },
    create: {
      email: "author@example.com",
      username: "author",
      nickname: "博客作者",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    }
  });

  const categories = {
    engineering: await prisma.category.upsert({
      where: {
        slug: "engineering"
      },
      update: {
        name: "工程",
        description: "软件工程、系统设计与上线实践",
        sortOrder: 10
      },
      create: {
        name: "工程",
        slug: "engineering",
        description: "软件工程、系统设计与上线实践",
        sortOrder: 10
      }
    }),
    notes: await prisma.category.upsert({
      where: {
        slug: "notes"
      },
      update: {
        name: "笔记",
        description: "学习记录与阶段性观察",
        sortOrder: 20
      },
      create: {
        name: "笔记",
        slug: "notes",
        description: "学习记录与阶段性观察",
        sortOrder: 20
      }
    })
  };

  const tags = {
    launch: await prisma.tag.upsert({
      where: {
        slug: "launch"
      },
      update: {
        name: "上线",
        color: "#2f6f5e"
      },
      create: {
        name: "上线",
        slug: "launch",
        color: "#2f6f5e"
      }
    }),
    writing: await prisma.tag.upsert({
      where: {
        slug: "writing"
      },
      update: {
        name: "写作",
        color: "#9a6a2f"
      },
      create: {
        name: "写作",
        slug: "writing",
        color: "#9a6a2f"
      }
    }),
    vue: await prisma.tag.upsert({
      where: {
        slug: "vue"
      },
      update: {
        name: "Vue",
        color: "#2f6f5e"
      },
      create: {
        name: "Vue",
        slug: "vue",
        color: "#2f6f5e"
      }
    }),
    nestjs: await prisma.tag.upsert({
      where: {
        slug: "nestjs"
      },
      update: {
        name: "NestJS",
        color: "#7c3f58"
      },
      create: {
        name: "NestJS",
        slug: "nestjs",
        color: "#7c3f58"
      }
    })
  };

  for (const post of posts) {
    const tagLinks = post.tagSlugs.map((tagSlug) => ({
      tagId: tags[tagSlug].id
    }));

    await prisma.post.upsert({
      where: {
        slug: post.slug
      },
      update: {
        title: post.title,
        summary: post.summary,
        contentMd: post.contentMd,
        contentHtml: post.contentHtml,
        status: PostStatus.PUBLISHED,
        visibility: Visibility.PUBLIC,
        authorId: author.id,
        categoryId: categories[post.categorySlug].id,
        allowComment: false,
        publishedAt: post.publishedAt,
        deletedAt: null,
        tags: {
          deleteMany: {},
          create: tagLinks
        }
      },
      create: {
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        contentMd: post.contentMd,
        contentHtml: post.contentHtml,
        status: PostStatus.PUBLISHED,
        visibility: Visibility.PUBLIC,
        authorId: author.id,
        categoryId: categories[post.categorySlug].id,
        allowComment: false,
        publishedAt: post.publishedAt,
        tags: {
          create: tagLinks
        }
      }
    });
  }

  for (const category of Object.values(categories)) {
    const postCount = await prisma.post.count({
      where: {
        categoryId: category.id,
        deletedAt: null,
        status: PostStatus.PUBLISHED,
        visibility: Visibility.PUBLIC
      }
    });

    await prisma.category.update({
      where: {
        id: category.id
      },
      data: {
        postCount
      }
    });
  }

  for (const tag of Object.values(tags)) {
    const postCount = await prisma.postTag.count({
      where: {
        tagId: tag.id,
        post: {
          deletedAt: null,
          status: PostStatus.PUBLISHED,
          visibility: Visibility.PUBLIC
        }
      }
    });

    await prisma.tag.update({
      where: {
        id: tag.id
      },
      data: {
        postCount
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
