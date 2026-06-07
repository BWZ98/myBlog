import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  check() {
    return {
      code: 0,
      message: "ok",
      data: {
        status: "ok",
        timestamp: new Date().toISOString()
      }
    };
  }
}
