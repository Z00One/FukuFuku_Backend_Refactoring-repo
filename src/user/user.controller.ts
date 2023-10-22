import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  Patch,
  Delete,
  Req,
  UseInterceptors,
  Headers,
  UseGuards,
  HttpCode,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  UpdateUserIntroductionDto,
  UpdateUserNicknameDto,
} from './dto/update-user.dto';
import { IsAuthenticable } from 'src/common/decorators/authentic.decorator';
import { responseFormat, OK, NoContent, Created } from '../common/util/responseFormat';
import { UserDeleteWhereDto } from './dto/delete-user.dto';
import { fileInterceptor } from '../common/util/upload.interceptor';
import { AccessGuard } from 'src/common/guard/access.guard';
import { UserRoleGuard } from 'src/common/guard/role.guard';
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) { }

  // 닉네임 중복 체크
  @UseGuards(AccessGuard)
  @Get('/check/:nickName')
  async isExistNickname(@Param('nickName') nickname: string) {
    await this.userService.nicknameDuplicateCheck(nickname, 'request');
    return responseFormat(OK);
  }

  // 좋아요 누른 글 불러오기 - mypage
  @UseGuards(AccessGuard)
  @Get('/liked')
  async myLiked(@Body('client') client: string | {
    [key: string]: any;
  }) {
    return this.userService.myLiked(client);
  }

  // 닉네임 수정
  @IsAuthenticable(UserRoleGuard, 'author', 'id')
  @HttpCode(201)
  @Put('/editNickname')
  async editNickname(@Body('data') data: UpdateUserNicknameDto) {
    const result = await this.userService.editNickname(data);

    return responseFormat(Created, result);
  }

  // 자기 소개 수정
  @IsAuthenticable(UserRoleGuard, 'author', 'id')
  @Patch('/editIntroduction')
  async editIntroduction(@Body('data') updateData: UpdateUserIntroductionDto) {
    const result = await this.userService.editIntroduction(updateData);

    return responseFormat(OK, result);
  }

  // 회원 탈퇴
  @IsAuthenticable(UserRoleGuard, 'author', 'id')
  @Delete('/withdraw')
  @HttpCode(204)
  async withdraw(@Body('data') userData: UserDeleteWhereDto) {
    await this.userService.withdraw(userData);

    return responseFormat(NoContent);
  }

  // 이미지 수정
  @IsAuthenticable(UserRoleGuard, 'author', 'id')
  @Put('/editImage')
  @UseInterceptors(fileInterceptor)
  async editImage(@Req() req, @Headers('data') u_id) {
    const id = parseInt(u_id, 10);

    const result = await this.userService.editPicture(id, req);

    return responseFormat(OK, result);
  }

  // 유저 페이지로 이동
  @Get('/:nickName')
  async userPage(
    @Param('nickName') nickName: string,
    @Query() option: { page: number }) {
    const userPage = await this.userService.mypage(nickName, option.page);
    return userPage;
  }

}
