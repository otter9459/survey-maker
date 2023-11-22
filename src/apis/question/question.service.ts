import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Question } from './entity/question.entity';
import { Repository } from 'typeorm';
import { SurveyService } from '../survey/survey.service';
import { IQuestionServiceCreate } from './interfaces/question-service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { SURVEY_STATUS } from '../survey/entity/survey.entity';
import { ForbiddenError } from 'apollo-server-express';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,

    private readonly surveyService: SurveyService,
  ) {}

  async fetchOne({ questionId }): Promise<Question> {
    return this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['options'],
    });
  }

  async create({
    surveyId,
    createQuestionInput,
  }: IQuestionServiceCreate): Promise<Question> {
    const { content, multiple } = createQuestionInput;

    const survey = await this.surveyService.findOne({ surveyId });
    if (!survey)
      throw new NotFoundException('등록할 설문지의 정보가 존재하지 않습니다.');

    const contentExist = await this.questionRepository.find({
      where: { content },
    });

    if (contentExist.length)
      throw new ForbiddenError('이미 같은 내용을 가진 문항이 존재합니다.');

    return await this.questionRepository.save({
      content,
      multiple,
      survey,
    });
  }

  async update({ questionId, updateQuestionInput }): Promise<boolean> {
    const { priority } = updateQuestionInput;

    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['survey', 'survey.questions'],
    });

    if (question.survey.status === SURVEY_STATUS.ISSUANCE)
      throw new BadRequestException(
        '발행 상태인 설문의 문항은 수정이 불가능합니다.',
      );

    if (question.survey.status === SURVEY_STATUS.COMPLETE) {
      throw new BadRequestException(
        '완료된 설문은 수정이 불가능합니다. 설문지 버전 업데이트 후 재시도 해주세요.',
      );
    }

    const exist = question.survey.questions.find(
      (el) => el.priority === priority,
    );

    if (exist)
      throw new BadRequestException(
        '이미 해당 우선 순위를 가진 문항이 존재합니다.',
      );

    const result = await this.questionRepository.update(
      { id: questionId },
      { ...updateQuestionInput },
    );

    return result.affected ? true : false;
  }

  async delete({ questionId }): Promise<boolean> {
    const result = await this.questionRepository.delete({ id: questionId });
    return result.affected ? true : false;
  }
}
