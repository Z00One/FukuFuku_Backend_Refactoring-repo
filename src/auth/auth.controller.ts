import {
  Controller,
  UseGuards,
  Request,
  Body,
  Post,
  Get,
} from '@nestjs/common';
import { RefreshGuard } from 'src/common/guard/refresh.guard';
import { AuthService } from './auth.service';
import { responseFormat, Created, OK } from '../common/util/responseFormat';
import { AccessGuard } from 'src/common/guard/access.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async googleAuth(@Body('credential') credential) {
    const data = await this.authService.signByGOuth(credential);
    return data;
  }

  @UseGuards(RefreshGuard)
  @Post('refresh')
  async refresh(@Request() req) {
    const accessToken = req.body.accessToken;

    return responseFormat(Created, { accessToken });
  }

  @UseGuards(AccessGuard)
  @Get('')
  verifyUser() {
    return OK;
  }
}
