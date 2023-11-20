import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin/admin.service';
import * as bcrypt from 'bcrypt';
import { IAuthServiceGetAccessToken } from './interfaces/auth-service.interface';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, //
    private readonly adminService: AdminService,
    private readonly userService: UserService,
  ) {}

  async loginAdmin({ email, password }): Promise<string> {
    const admin = await this.adminService.findOneByEmail({ email });

    if (!admin)
      throw new NotFoundException('존재하지 않는 관리자 이메일입니다.');

    const isAuth = await bcrypt.compare(password, admin.password);

    if (!isAuth) throw new BadRequestException('암호를 확인해 주세요.');

    return this.getAccessToken({ user: admin, key: process.env.JWT_ADMIN_KEY });
  }

  async loginUser({ email, password }): Promise<string> {
    const user = await this.userService.findOneByEmail({ email });

    if (!user)
      throw new NotFoundException('존재하지 않는 사용자 이메일입니다.');

    const isAuth = await bcrypt.compare(password, user.password);

    if (!isAuth) throw new BadRequestException('암호를 확인해 주세요.');

    return this.getAccessToken({ user, key: process.env.JWT_ACCESS_KEY });
  }

  getAccessToken({ user, key }: IAuthServiceGetAccessToken): string {
    return this.jwtService.sign(
      { sub: user.id },
      { secret: key, expiresIn: '1d' }, // 원활한 테스트를 위해 긴 유효기간 적용
    );
  }
}
