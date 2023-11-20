import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne({ id }): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['responses'],
    });
  }

  async findOneByEmail({ email }): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create({ createUserInput }): Promise<User> {
    const { name, age, gender, email, password } = createUserInput;

    const emailExist = await this.userRepository.find({ where: { email } });
    if (emailExist.length)
      throw new ConflictException('이미 존재하는 이메일입니다.');

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.userRepository.save({
      name,
      age,
      gender,
      email,
      password: hashedPassword,
    });
  }
}
