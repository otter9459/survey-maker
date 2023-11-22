import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Cache } from 'cache-manager';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtAdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ADMIN_KEY,
      passReqToCallback: true,
    });
  }

  async validate(req, payload) {
    try {
      const accessToken = req.headers.authorization.replace('Bearer ', '');

      const redisAccess = await this.cacheManager.get(
        `accessToken:${accessToken}`,
      );
      if (redisAccess)
        throw new UnauthorizedException('로그아웃된 토큰입니다.');

      return {
        id: payload.sub,
      };
    } catch (e) {
      throw e;
    }
  }
}
