import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { BoardImage } from "@prisma/client";

@Injectable()
export class UploadRepository {
  constructor(private prisma: PrismaService) {}

  async findImage(url: string): Promise<BoardImage> {
    return this.prisma.boardImage.findFirst({
      where: {
        url,
      },
    });
  }

  async deleteImage(url: string) {
    return this.prisma.boardImage.delete({
      where: { url },
    });
  }

  async storeTempImage(url: string, key: string) {
    return this.prisma.image.create({
      data: {
        url,
        key,
      },
    });
  }

  async deleteTempImage(url: string) {
    return this.prisma.image.delete({
      where: {
        url,
      },
    });
  }
}
