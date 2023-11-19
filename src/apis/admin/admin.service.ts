import { ConflictException, Injectable } from '@nestjs/common';
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

  async findOneByEmail({ email }) {
    return this.adminRepository.findOne({ where: { email } });
  }

  async create({ createAdminInput }) {
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
}
