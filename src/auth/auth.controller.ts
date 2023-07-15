import {
  Controller,
  Get,
  Req,
  UseGuards,
  Request,
  Body,
  Post,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccessGuard } from '../guard/access.guard';
import { RefreshGuard } from 'src/guard/refresh.guard';
import { AuthService } from './auth.service';
import { config } from 'dotenv';
import { responseFormat, OK, Created } from '../util/responseFormat';

config();

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  googleAuth(@Req() req) {}

  @Get(process.env.CALLBACK_PATH)
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    const data = await this.authService.signByGOuth(req);
    return responseFormat(OK, data);
  }

  @HttpCode(201)
  @UseGuards(RefreshGuard)
  @Post('refresh')
  async refresh(@Request() req) {
    const accessToken = req.body.accessToken;

    return responseFormat(Created, { accessToken });
  }
}
