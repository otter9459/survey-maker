import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin/admin.service';
import * as bcrypt from 'bcrypt';
import { IAuthServiceGetAccessToken } from './interfaces/auth-service.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, //
    private readonly adminService: AdminService,
  ) {}

  async loginAdmin({ email, password }): Promise<string> {
    const admin = await this.adminService.findOneByEmail({ email });

    if (!admin)
      throw new UnprocessableEntityException(
        '존재하지 않는 관리자 이메일입니다.',
      );

    const isAuth = await bcrypt.compare(password, admin.password);

    if (!isAuth)
      throw new UnprocessableEntityException('암호를 확인해 주세요.');

    return this.getAccessToken({ user: admin });
  }

  getAccessToken({ user }: IAuthServiceGetAccessToken): string {
    return this.jwtService.sign(
      { sub: user.id },
      { secret: process.env.JWT_ADMIN_KEY, expiresIn: '1d' }, // 원활한 테스트를 위해 긴 유효기간 적용
    );
  }
}
