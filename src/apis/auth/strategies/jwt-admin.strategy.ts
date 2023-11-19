import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtAdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ADMIN_KEY,
    });
  }

  async validate(payload) {
    try {
      return {
        id: payload.sub,
      };
    } catch (e) {
      throw e;
    }
  }
}
