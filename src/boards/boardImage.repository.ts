import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class PostImageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /** 이미지 연결 */
  async connect(
    data: { b_id: number; url: string; key: string }[],
  ): Promise<void> {
    await this.prismaService.boardImage.createMany({
      data,
    });
  }

  /** 게시글의 모든 이미지 가져오기 */
  async getImages(id: number) {
    return this.prismaService.boardImage.findMany({
      where: {
        b_id: id,
      },
    });
  }

  /** 임시저장 이미지 여부 확인 */
  async getTempImage(OR: { url: string }[]) {
    return this.prismaService.image.findMany({
      where: {
        OR,
      },
    });
  }

  /** 임시 저장 이미지 삭제 */
  async deleteTempImage(OR: { url: string }[]) {
    return this.prismaService.image.deleteMany({
      where: {
        OR,
      },
    });
  }
}
