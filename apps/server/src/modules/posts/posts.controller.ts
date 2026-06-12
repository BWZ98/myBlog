import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PostsService } from "./posts.service";

interface ApiSuccessResponse {
  code: number;
  message: string;
  data: unknown;
}

@ApiTags("posts")
@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findPublishedPosts(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("pageSize", new DefaultValuePipe(20), ParseIntPipe) pageSize: number
  ): Promise<ApiSuccessResponse> {
    return {
      code: 0,
      message: "ok",
      data: await this.postsService.findPublishedPosts(page, pageSize)
    };
  }

  @Get("archive")
  async findArchive(): Promise<ApiSuccessResponse> {
    return {
      code: 0,
      message: "ok",
      data: await this.postsService.findArchive()
    };
  }

  @Get(":slug")
  async findPostBySlug(@Param("slug") slug: string): Promise<ApiSuccessResponse> {
    return {
      code: 0,
      message: "ok",
      data: await this.postsService.findPostBySlug(slug)
    };
  }
}
