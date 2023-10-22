import {
  Controller,
  Post,
  Req,
  UseInterceptors,
  HttpCode,
  Delete,
  Body,
} from "@nestjs/common";
import { UploadService } from "./upload.service";
import { IsAuthenticable } from "src/common/decorators/authentic.decorator";
import { UserRoleGuard } from "src/common/guard/role.guard";
import { fileInterceptor } from "src/common/util/upload.interceptor";
import { Request } from "express";

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // 단일 이미지 업로드
  @IsAuthenticable(UserRoleGuard, "author", "id")
  @HttpCode(201)
  @Post()
  @UseInterceptors(fileInterceptor)
  async imageUpload(@Req() req: Request) {
    // 이미지 업로드
    const result = await this.uploadService.upload(req);

    // 비동기적으로 이미지 체크
    this.uploadService.check(result);

    return { url: result.url };
  }

  // 이미지 삭제
  @IsAuthenticable(UserRoleGuard, "author", "u_id")
  @HttpCode(204)
  @Delete()
  async deleteImage(@Body("data") data: { u_id: number; url: string }) {
    await this.uploadService.deleteImage(data.url);
  }
}
