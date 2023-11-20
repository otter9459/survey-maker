import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Option } from './entity/option.entity';
import { Repository } from 'typeorm';
import { QuestionService } from '../question/question.service';

@Injectable()
export class OptionService {
  constructor(
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>, //

    private readonly questionService: QuestionService,
  ) {}

  async create({ questionId, createOptionInput }): Promise<Option> {
    const { content, fixed_order, score } = createOptionInput;

    const question = await this.questionService.fetchOne({ questionId });

    if (!question)
      throw new NotFoundException('등록할 문항의 정보가 존재하지 않습니다.');

    const ordered = question.options.map((ele) => ele.fixed_order);

    if (ordered.includes(fixed_order))
      throw new BadRequestException(
        '이미 해당 번호를 가진 선택지가 존재합니다.',
      );

    return await this.optionRepository.save({
      content,
      fixed_order,
      score,
      question,
    });
  }
}
