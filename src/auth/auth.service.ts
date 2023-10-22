import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  decodeBase64(credential: string) {
    const base64Payload = credential.split('.')[1];
    const payloadBuffer = Buffer.from(base64Payload, 'base64');
    const updatedJwtPayload = JSON.parse(payloadBuffer.toString());
    return updatedJwtPayload;
  }

  async signByGOuth(credential: string) {
    const { email, picture, given_name, family_name } = this.decodeBase64(credential);
    const googleUserInfo = { email, picture, given_name, family_name }

    if (
      googleUserInfo.email.split('@')[1] !==
      this.configService.get<string>('YEUNGJIN_EMAIL_FORMAT')
    ) {
      throw new UnauthorizedException('영진전문대 학생만 사용할 수 있어요.');
    }

    const userInfo = await this.userService.sign(googleUserInfo);

    // token
    const accessToken = await this.generateToken(
      userInfo,
      'JWT_ACCESS_SECRET',
      'JWT_ACCESS_EXPRIESIN',
    );
    const refreshToken = await this.generateToken(
      userInfo,
      'JWT_REFRESH_SECRET',
      'JWT_REFRESH_EXPRIESIN',
    );

    return { ...userInfo, accessToken, refreshToken };
  }

  async refresh(tokens) {
    try {
      const accessPayload = this.jwtService.decode(
        tokens.accessToken,
      );
      const refreshPayload = this.jwtService.decode(
        tokens.refreshToken,
      );
      // access token, refresh token의 발행 정보를 대조
      if (accessPayload === null || refreshPayload === null) {
        return false;
      }

      const isAuthenticable =
        accessPayload['id'] === refreshPayload['id'] && accessPayload['nickName'] === refreshPayload['nickName']

      if (!isAuthenticable) {
        return false;
      }

      const userInfo = await this.userService.findUser(
        { id: refreshPayload['id'] }
      );

      const newAccesstoken = await this.generateToken(
        userInfo,
        'JWT_ACCESS_SECRET',
        'JWT_ACCESS_EXPRIESIN',
      );

      return newAccesstoken;
    } catch (error) {
      return false;
    }
  }

  async generateToken(
    userInfo: User,
    type: string,
    expiresIn: string,
  ): Promise<string> {
    const payload = {
      nickName: userInfo.nickName,
      id: userInfo.id
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>(type),
      expiresIn: this.configService.get<string>(expiresIn),
    });

    return 'Bearer ' + token;
  }
}
