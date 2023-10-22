import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Prisma, UserImage } from "@prisma/client";

@Injectable()
export class UserImageRepository {
  constructor(private prisma: PrismaService) {}

  async findOne(
    userWhereUniqueInput: Prisma.UserImageWhereUniqueInput,
  ): Promise<UserImage | null> {
    return this.prisma.userImage.findFirst({
      where: userWhereUniqueInput,
    });
  }

  async store(
    imageCreateInput: Prisma.UserImageUncheckedCreateInput,
  ): Promise<UserImage> {
    return this.prisma.userImage.create({
      data: imageCreateInput,
    });
  }

  async update(
    imageUpdateInput: Prisma.UserImageCreateManyInput,
  ): Promise<UserImage> {
    return this.prisma.userImage.update({
      where: {
        u_id: imageUpdateInput.u_id,
      },
      data: {
        url: imageUpdateInput.url,
        key: imageUpdateInput.key,
      },
    });
  }
}
