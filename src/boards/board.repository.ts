import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { Board, Prisma } from "@prisma/client";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";

@Injectable()
export class BoardRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /** 게시판 가져오기 */
  async getAllBoards(
    searchOption: object | [] = undefined,
    lastId: number,
  ): Promise<Board[]> {
    const TAKE_NUM = 10;

    return this.prismaService.board.findMany({
      take: TAKE_NUM,
      skip: lastId ? 0 : undefined,
      ...(lastId && { cursor: { id: lastId - 1 } }),
      where: searchOption["where"],
      orderBy: searchOption["orderBy"],
      include: {
        boardImage: { select: { url: true } },
        user: { select: { id: true, nickName: true, picture: true } },
        like: true,
        board_tag: { select: { tag: true } },
      },
    });
  }

  /** 특정한 글 하나 가져오기 */
  async getBoardById(userWhereUniqueInput: number) {
    return this.prismaService.board.findFirst({
      where: {
        id: userWhereUniqueInput,
      },
      include: {
        like: { select: { u_id: true } },
        comment: { include: { user: true, reply: true } },
        user: { select: { picture: true, nickName: true, introduction: true } },
        board_tag: { select: { tag: true } },
        boardImage: { select: { url: true } },
      },
    });
  }

  /** 유저가 작성한 글 가져오기 */
  async getUsersBoards(nickName: string) {
    return this.prismaService.user.findMany({
      where: {
        nickName,
      },
      include: {
        board: {
          include: {
            boardImage: true,
            like: true,
            board_tag: { select: { tag: true } },
          },
        },
      },
    });
  }

  /** 게시글 생성 */
  async create(createPostDto: CreateBoardDto) {
    const board = await this.prismaService.board.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        user: {
          connect: { id: createPostDto.id },
        },
      },
    });

    // 태그 생성
    for (const tagName of createPostDto.tags) {
      const tag = await this.prismaService.tag.upsert({
        where: { name: tagName },
        create: { name: tagName },
        update: { name: tagName },
      });

      // 게시글과 태그를 연결
      await this.prismaService.board_Tag.create({
        data: {
          board: {
            connect: { id: board.id },
          },
          tag: {
            connect: { id: tag.id },
          },
        },
      });
    }

    return board;
  }

  /** 게시글 삭제 */
  async deleteBoard(where: Prisma.BoardWhereUniqueInput): Promise<Board> {
    return this.prismaService.board.delete({
      where,
    });
  }

  /** 게시글 수정 */
  async updateBoard(editBoardDto: UpdateBoardDto): Promise<Board> {
    const board = await this.prismaService.board.update({
      where: { id: editBoardDto.b_id },
      data: {
        title: editBoardDto.title,
        content: editBoardDto.content,
      },
    });

    // 기존 연결 삭제
    await this.prismaService.board_Tag.deleteMany({
      where: {
        b_id: editBoardDto.b_id,
      },
    });

    for (const tagName of editBoardDto.tags) {
      const tag = await this.prismaService.tag.upsert({
        where: { name: tagName },
        create: { name: tagName },
        update: { name: tagName },
      });

      // 게시글과 태그를 연결
      await this.prismaService.board_Tag.create({
        data: {
          board: {
            connect: { id: board.id },
          },
          tag: {
            connect: { id: tag.id },
          },
        },
      });
    }

    return board;
  }

  /** 게시글 검색 태그도 검색 */
  async searchBoard(where: Prisma.BoardWhereInput): Promise<Board[]> {
    return this.prismaService.board.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            picture: true,
            nickName: true,
          },
        },
        board_tag: {
          select: { tag: true },
        },
      },
    });
  }

  /** 조회 수 올리기 */
  async updateViews(id: number) {
    await this.prismaService.board.update({
      where: {
        id: id,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  }
}
