import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Admin } from './entity/admin.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>, //
  ) {}

  async findOne({ id }): Promise<Admin> {
    return this.adminRepository.findOne({ where: { id } });
  }

  async findOneByEmail({ email }): Promise<Admin> {
    return this.adminRepository.findOne({ where: { email } });
  }

  async create({ createAdminInput }): Promise<Admin> {
    const { name, email, password } = createAdminInput;

    const exist = await this.adminRepository.find({ where: { email } });
    if (exist.length)
      throw new ConflictException('이미 존재하는 이메일입니다.');

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.adminRepository.save({
      name,
      email,
      password: hashedPassword,
    });
  }

  async updatePassword({
    email,
    currentPassword,
    newPassword,
  }): Promise<boolean> {
    const admin = await this.findOneByEmail({ email });
    if (!admin) throw new NotFoundException('존재하지 않는 관리자 정보입니다.');

    const isCorrect = await bcrypt.compare(currentPassword, admin.password);
    if (!isCorrect) throw new BadRequestException('기존 암호가 틀립니다.');

    const isSame = await bcrypt.compare(newPassword, admin.password);
    if (isSame)
      throw new BadRequestException(
        '기존 암호와 같은 암호로는 변경할 수 없습니다.',
      );

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await this.adminRepository.update(
      { id: admin.id },
      { password: hashedPassword },
    );

    return result.affected ? true : false;
  }

  async resign({ id }): Promise<boolean> {
    const resignResult = await this.adminRepository.softDelete({ id });

    return resignResult.affected ? true : false;
  }
}
