import type { ApiResponse, PageResult, PostListItem } from "@myblog/shared";
import { http } from "./http";

export async function getPosts() {
  const { data } = await http.get<ApiResponse<PageResult<PostListItem>>>("/posts");
  return data.data;
}
