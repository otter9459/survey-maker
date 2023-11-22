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
    const { content, score } = createOptionInput;

    const question = await this.questionService.fetchOne({ questionId });

    if (!question)
      throw new NotFoundException('등록할 문항의 정보가 존재하지 않습니다.');

    return await this.optionRepository.save({
      content,
      score,
      question,
    });
  }

  async update({ optionId, updateOptionInput }): Promise<boolean> {
    const { priority } = updateOptionInput;

    const option = await this.optionRepository.findOne({
      where: { id: optionId },
      relations: ['question', 'question.survey', 'question.options'],
    });

    if (option.question.survey.status === SURVEY_STATUS.ISSUANCE)
      throw new BadRequestException(
        '발행 상태인 설문의 선택지는 수정이 불가능합니다.',
      );

    if (option.question.survey.status === SURVEY_STATUS.COMPLETE) {
      throw new BadRequestException(
        '완료된 설문은 수정이 불가능합니다. 설문지 버전 업데이트 후 재시도 해주세요.',
      );
    }

    if (option.question.options.length < priority)
      throw new BadRequestException(
        '우선 순위는 존재하는 선택지의 갯수를 벗어날 수 없습니다.',
      );

    const exist = option.question.options.find(
      (el) => el.priority === priority,
    );

    if (exist)
      throw new BadRequestException(
        '이미 해당 우선 순위를 가진 선택지가 존재합니다.',
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
