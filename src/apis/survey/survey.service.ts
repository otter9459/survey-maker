import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SURVEY_STATUS, Survey } from './entity/survey.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRespository: Repository<Survey>,
  ) {}

  async findOne({ surveyId }): Promise<Survey> {
    return this.surveyRespository.findOne({
      where: { id: surveyId },
      relations: ['questions', 'questions.options'],
    });
  }

  async fetchList({ page }): Promise<Survey[]> {
    return this.surveyRespository.find({
      relations: ['questions', 'questions.options'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * 10,
      take: 10,
    });
  }

  async fetchComplete({ adminId, surveyId, version }) {
    // 미완성, 답변까지 모두 제작되면 진행 - feature#5 브랜치
    const survey = await this.findOne({ surveyId });
    if (survey.author.id !== adminId)
      throw new BadRequestException(
        '본인이 제작한 설문의 결과만 볼 수 있습니다.',
      );

    if (survey.status !== SURVEY_STATUS.COMPLETE && version !== survey.version)
      throw new ForbiddenException('해당 설문은 완료되지 않았습니다.');

    // const list = await this.surveyRespository.findOne({
    //   where: { id: surveyId, responses: { survey_version: version } },
    //   relations: ['responses', 'responses.responseDetails'],
    // });

    // list.responses[0].responseDetails[0].option_content;
    // list.responses[0].responseDetails[0].question_content;
    // list.responses[0].responseDetails[0].score;
    // 위 세가지를 사용해서 문항 정리, 선택지 정리, 선택지 비율 계산, 총점 평균 계산 알고리즘 제작 필요
  }

  async create({ context, createSurveyInput }): Promise<Survey> {
    const { title, description, target_number } = createSurveyInput;
    const isExist = await this.surveyRespository.find({ where: { title } });
    if (isExist.length)
      throw new ConflictException('같은 제목의 설문이 존재합니다.');

    return this.surveyRespository.save({
      title,
      description,
      target_number,
      author: context,
    });
  }

  async update({ adminId, updateSurveyInput }): Promise<boolean> {
    const { id, title, target_number } = updateSurveyInput;

    const survey = await this.findOne({ surveyId: id });
    if (survey.author.id !== adminId)
      throw new BadRequestException(
        '본인이 제작한 설문의 정보만 수정할 수 있습니다. 볼 수 있습니다.',
      );

    const isExist = await this.surveyRespository.find({ where: { title } });
    if (isExist.length)
      throw new ConflictException('같은 제목의 설문이 존재합니다.');

    const respondant = await this.surveyRespository.findOne({
      where: { id },
      relations: ['responses'],
    });

    if (respondant >= target_number) null;
    // 현재 참여자 수보다 입력된 target_number가 작을 경우
    // 상태를 complete로 변경하는 로직

    const result = await this.surveyRespository.update(
      { id },
      { ...survey, ...updateSurveyInput },
    );

    return result.affected ? true : false;
  }
}
