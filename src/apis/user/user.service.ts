import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async update({ userId, updateUserInput }): Promise<boolean> {
    const result = await this.userRepository.update(
      { id: userId },
      { ...updateUserInput },
    );

    return result.affected ? true : false;
  }

  async updatePassword({
    email,
    currentPassword,
    newPassword,
  }): Promise<boolean> {
    const user = await this.findOneByEmail({ email });
    if (!user) throw new NotFoundException('존재하지 않는 사용자 정보입니다.');

    const isCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCorrect) throw new BadRequestException('기존 암호가 틀립니다.');

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame)
      throw new BadRequestException(
        '기존 암호와 같은 암호로는 변경할 수 없습니다.',
      );

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await this.userRepository.update(
      { id: user.id },
      { password: hashedPassword },
    );

    return result.affected ? true : false;
  }
}
