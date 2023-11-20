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

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,

    private readonly surveyService: SurveyService,
  ) {}

  async create({
    createQuestionInput,
  }: IQuestionServiceCreate): Promise<Question> {
    const { content, fixed_order, multiple, surveyId } = createQuestionInput;

    const survey = await this.surveyService.findOne({ surveyId });
    if (!survey)
      throw new NotFoundException('등록할 설문지의 정보가 존재하지 않습니다.');

    const ordered = survey.questions
      .filter((el) => el.fixed_order !== null)
      .map((ele) => ele.fixed_order);

    if (ordered.includes(fixed_order))
      throw new BadRequestException('이미 해당 번호를 가진 문항이 존재합니다.');

    return await this.questionRepository.save({
      content,
      fixed_order,
      multiple,
      survey,
    });
  }
}
