const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");
const { PrismaClient, PostStatus, UserRole, UserStatus, Visibility } = require("@prisma/client");

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

async function importPosts(options = {}) {
  const prisma = options.prisma ?? new PrismaClient();
  const shouldDisconnect = !options.prisma;
  const contentDir = resolveContentDir(options.contentDir);

  try {
    const files = readMarkdownFiles(contentDir);
    if (files.length === 0) {
      console.log(`No Markdown posts found in ${contentDir}`);
      return {
        imported: 0,
        files: []
      };
    }

    const author = await ensureAuthor(prisma);
    const importedFiles = [];

    for (const filePath of files) {
      const importedPost = await importOnePost(prisma, author.id, filePath);
      importedFiles.push(importedPost);
      console.log(`Imported ${importedPost.slug} from ${path.relative(process.cwd(), filePath)}`);
    }

    await refreshTaxonomyCounts(prisma);

    return {
      imported: importedFiles.length,
      files: importedFiles
    };
  } finally {
    if (shouldDisconnect) {
      await prisma.$disconnect();
    }
  }
}

async function syncPosts(options = {}) {
  const prisma = options.prisma ?? new PrismaClient();
  const shouldDisconnect = !options.prisma;
  const contentDir = resolveContentDir(options.contentDir);
  const deleteMissing = Boolean(options.deleteMissing);

  try {
    const importResult = await importPosts({
      prisma,
      contentDir
    });
    const importedSlugs = importResult.files.map((file) => file.slug);

    const missingPosts = await prisma.post.findMany({
      where:
        importedSlugs.length > 0
          ? {
              slug: {
                notIn: importedSlugs
              }
            }
          : {},
      select: {
        id: true,
        slug: true,
        title: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (missingPosts.length === 0) {
      console.log("Sync completed: no missing database posts.");
      return {
        ...importResult,
        missing: 0,
        deleted: 0,
        archived: 0
      };
    }

    if (deleteMissing) {
      await prisma.post.deleteMany({
        where: {
          id: {
            in: missingPosts.map((post) => post.id)
          }
        }
      });

      for (const post of missingPosts) {
        console.log(`Deleted missing post ${post.slug}`);
      }

      await refreshTaxonomyCounts(prisma);

      return {
        ...importResult,
        missing: missingPosts.length,
        deleted: missingPosts.length,
        archived: 0
      };
    }

    await prisma.post.updateMany({
      where: {
        id: {
          in: missingPosts.map((post) => post.id)
        }
      },
      data: {
        status: PostStatus.ARCHIVED,
        publishedAt: null
      }
    });

    for (const post of missingPosts) {
      console.log(`Archived missing post ${post.slug}`);
    }

    await refreshTaxonomyCounts(prisma);

    return {
      ...importResult,
      missing: missingPosts.length,
      deleted: 0,
      archived: missingPosts.length
    };
  } finally {
    if (shouldDisconnect) {
      await prisma.$disconnect();
    }
  }
}

async function ensureAuthor(prisma) {
  const email = process.env.BLOG_AUTHOR_EMAIL || "author@example.com";
  const username = process.env.BLOG_AUTHOR_USERNAME || "author";
  const nickname = process.env.BLOG_AUTHOR_NAME || "博客作者";

  return prisma.user.upsert({
    where: {
      email
    },
    update: {
      username,
      nickname,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    },
    create: {
      email,
      username,
      nickname,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    }
  });
}

async function importOnePost(prisma, authorId, filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const metadata = parsed.data;
  const contentMd = parsed.content.trim();
  const fallbackSlug = path.basename(filePath, path.extname(filePath));
  const slug = normalizeSlug(metadata.slug || fallbackSlug, fallbackSlug);
  const title = requireString(metadata.title, "title", filePath);
  const status = normalizeEnum(metadata.status ?? PostStatus.PUBLISHED, PostStatus, "status", filePath);
  const visibility = normalizeEnum(metadata.visibility ?? Visibility.PUBLIC, Visibility, "visibility", filePath);
  const publishedAt = normalizePublishedAt(metadata.publishedAt ?? metadata.date, status, filePath);
  const categoryInput = normalizeCategory(metadata.category);
  const tagInputs = normalizeTags(metadata.tags);
  const category = categoryInput ? await upsertCategory(prisma, categoryInput) : null;
  const tags = [];

  for (const tagInput of tagInputs) {
    tags.push(await upsertTag(prisma, tagInput));
  }

  const uniqueTags = dedupeBy(tags, "id");

  await prisma.post.upsert({
    where: {
      slug
    },
    update: {
      title,
      summary: optionalString(metadata.summary),
      coverUrl: optionalString(metadata.coverUrl),
      contentMd,
      contentHtml: markdown.render(contentMd),
      status,
      visibility,
      authorId,
      categoryId: category?.id ?? null,
      isTop: Boolean(metadata.isTop),
      allowComment: metadata.allowComment === undefined ? false : Boolean(metadata.allowComment),
      publishedAt,
      deletedAt: null,
      tags: {
        deleteMany: {},
        create: uniqueTags.map((tag) => ({
          tagId: tag.id
        }))
      }
    },
    create: {
      title,
      slug,
      summary: optionalString(metadata.summary),
      coverUrl: optionalString(metadata.coverUrl),
      contentMd,
      contentHtml: markdown.render(contentMd),
      status,
      visibility,
      authorId,
      categoryId: category?.id ?? null,
      isTop: Boolean(metadata.isTop),
      allowComment: metadata.allowComment === undefined ? false : Boolean(metadata.allowComment),
      publishedAt,
      tags: {
        create: uniqueTags.map((tag) => ({
          tagId: tag.id
        }))
      }
    }
  });

  return {
    slug,
    title,
    filePath
  };
}

async function upsertCategory(prisma, input) {
  return prisma.category.upsert({
    where: {
      slug: input.slug
    },
    update: {
      name: input.name,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 0
    },
    create: {
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 0
    }
  });
}

async function upsertTag(prisma, input) {
  return prisma.tag.upsert({
    where: {
      slug: input.slug
    },
    update: {
      name: input.name,
      color: input.color ?? null
    },
    create: {
      name: input.name,
      slug: input.slug,
      color: input.color ?? null
    }
  });
}

async function refreshTaxonomyCounts(prisma) {
  const categories = await prisma.category.findMany();
  for (const category of categories) {
    await prisma.category.update({
      where: {
        id: category.id
      },
      data: {
        postCount: await prisma.post.count({
          where: {
            categoryId: category.id,
            deletedAt: null,
            status: PostStatus.PUBLISHED,
            visibility: Visibility.PUBLIC
          }
        })
      }
    });
  }

  const tags = await prisma.tag.findMany();
  for (const tag of tags) {
    await prisma.tag.update({
      where: {
        id: tag.id
      },
      data: {
        postCount: await prisma.postTag.count({
          where: {
            tagId: tag.id,
            post: {
              deletedAt: null,
              status: PostStatus.PUBLISHED,
              visibility: Visibility.PUBLIC
            }
          }
        })
      }
    });
  }
}

function resolveContentDir(contentDir) {
  return path.resolve(process.cwd(), contentDir ?? "content/posts");
}

function readMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Markdown posts directory not found: ${dir}`);
  }

  return listMarkdownFiles(dir);
}

function listMarkdownFiles(dir) {
  const entries = fs.readdirSync(dir, {
    withFileTypes: true
  });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(entryPath));
      continue;
    }

    if (entry.isFile() && [".md", ".markdown"].includes(path.extname(entry.name).toLowerCase())) {
      files.push(entryPath);
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

function normalizeCategory(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return {
      name: value,
      slug: normalizeSlug(value, "category")
    };
  }

  if (typeof value === "object") {
    const name = requireString(value.name ?? value.slug, "category.name", "frontmatter");
    return {
      name,
      slug: normalizeSlug(value.slug ?? name, "category"),
      description: optionalString(value.description),
      sortOrder: Number.isInteger(value.sortOrder) ? value.sortOrder : 0
    };
  }

  throw new Error("category must be a string or object");
}

function normalizeTags(value) {
  if (!value) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error("tags must be an array");
  }

  return value.map((item) => {
    if (typeof item === "string") {
      return {
        name: item,
        slug: normalizeSlug(item, "tag")
      };
    }

    if (item && typeof item === "object") {
      const name = requireString(item.name ?? item.slug, "tag.name", "frontmatter");
      return {
        name,
        slug: normalizeSlug(item.slug ?? name, "tag"),
        color: optionalString(item.color)
      };
    }

    throw new Error("tag entries must be strings or objects");
  });
}

function normalizePublishedAt(value, status, filePath) {
  if (status !== PostStatus.PUBLISHED && !value) {
    return null;
  }

  if (!value) {
    throw new Error(`publishedAt is required for published post: ${filePath}`);
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid publishedAt in ${filePath}: ${value}`);
  }

  return date;
}

function normalizeEnum(value, enumObject, field, filePath) {
  const normalizedValue = String(value).toUpperCase();
  if (!Object.values(enumObject).includes(normalizedValue)) {
    throw new Error(`Invalid ${field} in ${filePath}: ${value}`);
  }

  return normalizedValue;
}

function requireString(value, field, filePath) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required frontmatter field "${field}" in ${filePath}`);
  }

  return value.trim();
}

function optionalString(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return value.trim();
}

function normalizeSlug(value, fallback) {
  const slug = String(value)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

function dedupeBy(items, key) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item[key])) {
      return false;
    }

    seen.add(item[key]);
    return true;
  });
}

if (require.main === module) {
  const contentDirArgIndex = process.argv.indexOf("--dir");
  const contentDir =
    contentDirArgIndex >= 0 && process.argv[contentDirArgIndex + 1]
      ? process.argv[contentDirArgIndex + 1]
      : undefined;
  const shouldSync = process.argv.includes("--sync");
  const deleteMissing = process.argv.includes("--delete-missing");

  const action = shouldSync ? syncPosts : importPosts;

  action({
    contentDir,
    deleteMissing
  })
    .then((result) => {
      if (shouldSync) {
        console.log(
          `Sync completed: ${result.imported} imported, ${result.archived} archived, ${result.deleted} deleted.`
        );
      }
    })
    .catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  importPosts,
  syncPosts
};
