import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin/admin.service';
import { IAuthServiceGetAccessToken } from './interfaces/auth-service.interface';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, //
    private readonly adminService: AdminService,
    private readonly userService: UserService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async loginAdmin({ email, password }): Promise<string> {
    const admin = await this.adminService.findOneByEmail({ email });

    if (!admin)
      throw new NotFoundException('존재하지 않는 관리자 이메일입니다.');

    const isAuth = await bcrypt.compare(password, admin.password);

    if (!isAuth) throw new BadRequestException('암호를 확인해 주세요.');

    return this.getAccessToken({
      user: admin,
      key: process.env.JWT_ADMIN_KEY,
      keyid: 'admin_key',
    });
  }

  async loginUser({ email, password }): Promise<string> {
    const user = await this.userService.findOneByEmail({ email });

    if (!user)
      throw new NotFoundException('존재하지 않는 사용자 이메일입니다.');

    const isAuth = await bcrypt.compare(password, user.password);

    if (!isAuth) throw new BadRequestException('암호를 확인해 주세요.');

    return this.getAccessToken({
      user,
      key: process.env.JWT_ACCESS_KEY,
      keyid: 'access_key',
    });
  }

  async logout({ context }): Promise<boolean> {
    const accessToken = context.req.headers.authorization.replace(
      'Bearer ',
      '',
    );

    const decodedToken = jwt.decode(accessToken, {
      complete: true,
    }) as jwt.JwtPayload;

    const usedKey = decodedToken.header.kid;

    const jwtKey =
      usedKey === 'access_key'
        ? process.env.JWT_ACCESS_KEY
        : usedKey === 'admin_key'
        ? process.env.JWT_ADMIN_KEY
        : '';

    try {
      const correctAccess = jwt.verify(
        accessToken, //
        jwtKey,
      ) as jwt.JwtPayload;

      const accessTtl = correctAccess.exp - correctAccess.iat;

      await this.cacheManager.set(
        `accessToken:${accessToken}`, //
        'accessToken',
        accessTtl,
      );

      const redisAccess = await this.cacheManager.get(
        `accessToken:${accessToken}`,
      );

      if (!redisAccess)
        throw new UnauthorizedException('로그아웃에 실패했습니다.');

      return true;
    } catch (error) {
      throw error;
    }
  }

  getAccessToken({ user, key, keyid }: IAuthServiceGetAccessToken): string {
    return this.jwtService.sign(
      { sub: user.id },
      { secret: key, keyid, expiresIn: '1d' }, // 원활한 테스트를 위해 긴 유효기간 적용
    );
  }
}
