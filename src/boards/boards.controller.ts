import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { Board } from "@prisma/client";
import { BoardsService } from "./boards.service";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";
import { IsAuthenticable } from "src/common/decorators/authentic.decorator";
import { UserRoleGuard } from "src/common/guard/role.guard";
import { SearchBoardDto } from "./dto/search-board.dto";

@Controller("boards")
export class BoardsController {
  constructor(private postsService: BoardsService) {}

  // 특정 사용자가 쓴 글 내에서 검색
  @Get("user/:nickName")
  searchUsersBoard(
    @Param("nickName") nickName: string,
    @Query("keyword") keyword: string,
  ) {
    return this.postsService.searchBoard(keyword, nickName);
  }

  // 게시판 가져오기
  @Get()
  getAllBoard(
    @Query() option: SearchBoardDto,
    @Query("lastId", ParseIntPipe) lastId: number,
  ): Promise<Board[]> {
    const dateOption = { gte: option.gte, lte: option.lte };
    return this.postsService.getAllBoards(option.option, dateOption, lastId);
  }

  // 특정한 글 하나 가져오기
  @Get("/:id")
  async getBoard(@Param("id", ParseIntPipe) id: number) {
    const test = this.postsService.getBoardById(id);
    return test;
  }

  // 특정 사용자가 작성한 게시글 가져오기
  @Get("/author/:nickName")
  getUsersBoard(@Param("nickName") nickName: string) {
    return this.postsService.getUsersBoards(nickName);
  }

  // 게시물 생성
  @IsAuthenticable(UserRoleGuard, "author", "id")
  @HttpCode(201)
  @Post()
  createBoard(@Body("data") createPostDto: CreateBoardDto): Promise<Board> {
    return this.postsService.createBoard(createPostDto);
  }

  // 게시물 삭제
  @IsAuthenticable(UserRoleGuard, "author", "id")
  @HttpCode(204)
  @Delete("/:id")
  deleteBoard(@Param("id", ParseIntPipe) id: number) {
    return this.postsService.deleteBoard(id);
  }

  // 글 수정
  @IsAuthenticable(UserRoleGuard, "author", "id")
  @Patch("/edit")
  updateBoard(@Body("data") editBoardDto: UpdateBoardDto): Promise<Board> {
    return this.postsService.updateBoard(editBoardDto);
  }

  // 게시물 검색
  @Get("/search/:keyword")
  searchBoard(@Param("keyword") keyword: string): Promise<Board[]> {
    return this.postsService.searchBoard(keyword);
  }
}
