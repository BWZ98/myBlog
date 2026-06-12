import { Injectable } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";
import { PostStatus, Visibility } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

interface TaxonomyItem {
  id: string;
  name: string;
  slug: string;
}

interface PostListItem {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  coverUrl?: string | null;
  publishedAt?: string | null;
  category?: TaxonomyItem | null;
  tags: TaxonomyItem[];
  viewCount: number;
  commentCount: number;
}

interface PostDetail extends PostListItem {
  contentHtml?: string | null;
  contentMd: string;
  updatedAt: string;
}

interface ArchiveMonth {
  key: string;
  year: number;
  month: number;
  posts: PostListItem[];
}

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublishedPosts(page = 1, pageSize = 20) {
    const safePage = Math.max(1, page);
    const safePageSize = Math.min(Math.max(1, pageSize), 50);
    const where = this.publishedPostWhere();
    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        include: {
          category: true,
          tags: {
            include: {
              tag: true
            }
          }
        },
        orderBy: [{ isTop: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (safePage - 1) * safePageSize,
        take: safePageSize
      }),
      this.prisma.post.count({ where })
    ]);

    return {
      items: items.map((post) => this.toPostListItem(post)),
      page: safePage,
      pageSize: safePageSize,
      total
    };
  }

  async findPostBySlug(slug: string): Promise<PostDetail> {
    const post = await this.prisma.post.findFirst({
      where: {
        ...this.publishedPostWhere(),
        slug
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    return {
      ...this.toPostListItem(post),
      contentHtml: post.contentHtml,
      contentMd: post.contentMd,
      updatedAt: post.updatedAt.toISOString()
    };
  }

  async findArchive(): Promise<ArchiveMonth[]> {
    const posts = await this.prisma.post.findMany({
      where: this.publishedPostWhere(),
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
    });

    const groups = new Map<string, ArchiveMonth>();

    for (const post of posts) {
      if (!post.publishedAt) {
        continue;
      }

      const year = post.publishedAt.getFullYear();
      const month = post.publishedAt.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, "0")}`;
      const group = groups.get(key) ?? {
        key,
        year,
        month,
        posts: []
      };

      group.posts.push(this.toPostListItem(post));
      groups.set(key, group);
    }

    return Array.from(groups.values());
  }

  private publishedPostWhere() {
    return {
      deletedAt: null,
      publishedAt: {
        not: null
      },
      status: PostStatus.PUBLISHED,
      visibility: Visibility.PUBLIC
    };
  }

  private toPostListItem(post: {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    coverUrl: string | null;
    publishedAt: Date | null;
    viewCount: number;
    commentCount: number;
    category: { id: string; name: string; slug: string } | null;
    tags: Array<{ tag: { id: string; name: string; slug: string } }>;
  }): PostListItem {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      coverUrl: post.coverUrl,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      category: post.category
        ? {
            id: post.category.id,
            name: post.category.name,
            slug: post.category.slug
          }
        : null,
      tags: post.tags
        .map(({ tag }) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug
        }))
        .sort((left, right) => left.name.localeCompare(right.name)),
      viewCount: post.viewCount,
      commentCount: post.commentCount
    };
  }
}
