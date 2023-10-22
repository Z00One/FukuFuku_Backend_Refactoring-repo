import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ReplysService } from './replys.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { Reply } from '@prisma/client';

@Controller('replys')
export class ReplysController {
  constructor(private replyService: ReplysService) {}

  // 현재 댓글의 답글 가져오기
  @Get('/:commentId')
  async getReplysByCommentId(
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return await this.replyService.getReplysByCommentId(commentId);
  }

  // 답글 생성
  @Post()
  async createReply(@Body() createReplyDto: CreateReplyDto): Promise<Reply> {
    console.log(createReplyDto);

    return this.replyService.createReply(createReplyDto);
  }

  // 답글 삭제
  @Delete('/:id')
  async deleteReply(@Param('id', ParseIntPipe) id: number): Promise<Reply> {
    return this.replyService.deleteReply(id);
  }

  // 답글 수정
  @Patch('/:id')
  async updateReply(
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
  ): Promise<Reply> {
    return this.replyService.updateReply(id, content);
  }
}
