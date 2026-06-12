import type { ApiResponse, ArchiveMonth, PageResult, PostDetail, PostListItem } from "@myblog/shared";
import { http } from "./http";

export async function getPosts() {
  const { data } = await http.get<ApiResponse<PageResult<PostListItem>>>("/posts");
  return data.data;
}

export async function getPostBySlug(slug: string) {
  const { data } = await http.get<ApiResponse<PostDetail>>(`/posts/${slug}`);
  return data.data;
}

export async function getArchive() {
  const { data } = await http.get<ApiResponse<ArchiveMonth[]>>("/posts/archive");
  return data.data;
}
