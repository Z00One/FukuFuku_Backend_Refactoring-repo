import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { AuthService } from '../../auth/auth.service';
import { ConfigService } from '@nestjs/config';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tokens = this.extractTokens(request);

    // 토큰 없는 경우
    if (!tokens) {
      throw new UnprocessableEntityException();
    }
    try {
      await this.jwtService.verifyAsync(tokens.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // access token 재발급
      const newAccesstoken = await this.authService.refresh(tokens);

      if (!newAccesstoken) {
        throw new UnauthorizedException();
      }

      request['body']['accessToken'] = newAccesstoken;

      return true;
    } catch (error) {
      const errorName = error?.name;

      if (
        errorName === 'TokenExpiredError' ||
        errorName === 'JsonWebTokenError' ||
        errorName === 'UnauthorizedException'
      ) {
        throw new UnauthorizedException();
      } else {
        throw new InternalServerErrorException(error);
      }
    }
  }

  // 토큰 추출
  private extractTokens(request: Request): Tokens | undefined {
    const [accessTokenType, accessToken] =
      request.headers?.authorization?.split(' ') ?? [];
    const [refreshTokenType, refreshToken] =
      request.body?.refreshToken?.split(' ') ?? [];

    const tokens: Tokens = { accessToken, refreshToken };

    const isRightType =
      refreshTokenType === 'Bearer' && accessTokenType === 'Bearer';
    const isToken = tokens?.accessToken && tokens?.refreshToken;

    if (isRightType && isToken) {
      return tokens;
    } else {
      return undefined;
    }
  }
}
