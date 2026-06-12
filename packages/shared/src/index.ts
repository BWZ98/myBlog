export const SITE_NAME = "MyBlog";

export enum UserRole {
  Visitor = "VISITOR",
  Admin = "ADMIN",
  SuperAdmin = "SUPER_ADMIN"
}

export enum PostStatus {
  Draft = "DRAFT",
  Published = "PUBLISHED",
  Archived = "ARCHIVED"
}

export enum ContentStatus {
  Pending = "PENDING",
  Approved = "APPROVED",
  Rejected = "REJECTED",
  Hidden = "HIDDEN",
  Deleted = "DELETED"
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface PostListItem {
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

export interface PostDetail extends PostListItem {
  contentHtml?: string | null;
  contentMd: string;
  updatedAt: string;
}

export interface TaxonomyItem {
  id: string;
  name: string;
  slug: string;
}

export interface ArchiveMonth {
  key: string;
  year: number;
  month: number;
  posts: PostListItem[];
}
