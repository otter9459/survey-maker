import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Option } from './entity/option.entity';
import { Repository } from 'typeorm';
import { QuestionService } from '../question/question.service';
import { SURVEY_STATUS } from '../survey/entity/survey.entity';

@Injectable()
export class OptionService {
  constructor(
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>, //

    private readonly questionService: QuestionService,
  ) {}

  async fetchOne({ optionId }): Promise<Option> {
    return this.optionRepository.findOne({ where: { id: optionId } });
  }

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

  async update({ optionId, updateOptionInput }): Promise<boolean> {
    const { fixed_order } = updateOptionInput;

    const option = await this.optionRepository.findOne({
      where: { id: optionId },
      relations: ['question', 'question.survey', 'question.options'],
    });

    if (option.question.survey.status !== SURVEY_STATUS.UNISSUED)
      throw new BadRequestException(
        '발행 상태인 설문의 선택지는 수정이 불가능합니다.',
      );

    const exist = option.question.options.find(
      (el) => el.fixed_order === fixed_order,
    );

    if (exist)
      throw new BadRequestException(
        '이미 해당 번호를 가진 선택지가 존재합니다.',
      );

    const result = await this.optionRepository.update(
      { id: optionId },
      { ...updateOptionInput },
    );

    return result.affected ? true : false;
  }

  async delete({ optionId }): Promise<boolean> {
    const result = await this.optionRepository.delete({ id: optionId });
    return result.affected ? true : false;
  }
}
