import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TagDto } from './dto/tag.dto';
import { Tag } from '@prisma/client';

@Injectable()
export class TagRepository {
  constructor(private prismaService: PrismaService) {}

  // tagId를 통해 태그 가져오기
  async findTagById(tagId: number): Promise<Tag> {
    return await this.prismaService.tag.findUnique({
      where: {
        id: tagId,
      },
    });
  }

  // 태그 이름으로 태그 가져오기
  async findTagByName(tagName: string): Promise<Tag> {
    return await this.prismaService.tag.findUnique({
      where: {
        name: tagName,
      },
      include: {
        board_tag: {
          include: {
            board: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  // 태그 생성
  async createTags(tagdto: TagDto): Promise<Tag> {
    return await this.prismaService.tag.create({
      data: {
        name: tagdto.name,
      },
    });
  }

  // 태그 id를 가지고 있는 게시물 가져오기
  async findBoardByTagId(tagId: number): Promise<Tag> {
    return await this.prismaService.tag.findUnique({
      where: {
        id: tagId,
      },
      include: {
        board_tag: {
          include: {
            board: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }
}
