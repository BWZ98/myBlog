import { Injectable } from "@nestjs/common";

@Injectable()
export class PostsService {
  findPublishedPosts() {
    return {
      items: [],
      page: 1,
      pageSize: 20,
      total: 0
    };
  }
}
