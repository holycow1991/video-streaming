import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtRefreshPayload } from '../types/jwt-payload.type';
import { AuthService } from '../auth.service';

interface RefreshTokenRequest extends Request {
  body: {
    refreshToken: string;
  };
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.refreshSecret'),
      passReqToCallback: true,
    });
  }

  async validate(req: RefreshTokenRequest, payload: JwtRefreshPayload) {
    const refreshToken = req.body.refreshToken;
    const session = await this.authService.validateRefreshToken(
      payload.sub,
      payload.tokenId,
      refreshToken,
    );
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return { id: payload.sub, tokenId: payload.tokenId };
  }
}
