import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PostsService } from "./posts.service";

@ApiTags("posts")
@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findPublishedPosts() {
    return {
      code: 0,
      message: "ok",
      data: this.postsService.findPublishedPosts()
    };
  }
}
