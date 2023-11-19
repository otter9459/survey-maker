import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SURVEY_STATUS, Survey } from './entity/survey.entity';
import { Repository, UpdateResult } from 'typeorm';
import { ISurveyServiceReturn } from './interfaces/answer-return.interface';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRespository: Repository<Survey>,
  ) {}

  async findOne({ surveyId }): Promise<ISurveyServiceReturn> {
    const result = await this.surveyRespository.findOne({
      where: { id: surveyId },
      relations: ['questions', 'questions.options', 'responses'],
    });

    return { ...result, respondant: result.responses.length };
  }

  async fetchList({ page }): Promise<ISurveyServiceReturn[]> {
    const results = await this.surveyRespository.find({
      relations: ['questions', 'questions.options', 'responses'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * 10,
      take: 10,
    });

    return results.map((survey) => {
      const respondant = survey.responses.filter(
        (response) => response.survey_version === survey.version,
      ).length;
      return { ...survey, respondant };
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
        '본인이 제작한 설문의 정보만 수정할 수 있습니다.',
      );

    const isExist = await this.surveyRespository.find({ where: { title } });
    if (isExist.length)
      throw new ConflictException('같은 제목의 설문이 존재합니다.');

    const respondant = await this.surveyRespository.findOne({
      where: { id },
      relations: ['responses'],
    });

    if (respondant.responses.length >= target_number) {
      await this.surveyRespository.update(
        { id },
        { status: SURVEY_STATUS.COMPLETE },
      );
    }

    const result = await this.surveyRespository.update(
      { id },
      { ...survey, ...updateSurveyInput },
    );

    return result.affected ? true : false;
  }

  async updateVersion({ adminId, surveyId }): Promise<boolean> {
    const survey = await this.findOne({ surveyId });
    if (survey.author.id !== adminId)
      throw new BadRequestException(
        '본인이 제작한 설문의 정보만 수정할 수 있습니다.',
      );

    if (survey.status !== SURVEY_STATUS.UNISSUED) {
      await this.surveyRespository.update(
        { id: surveyId },
        { status: SURVEY_STATUS.ISSUANCE },
      );
    }

    const result = await this.surveyRespository.update(
      { id: surveyId },
      { version: survey.version + 0.1 },
    );

    return result.affected ? true : false;
  }

  async manualComplete({ adminId, surveyId }): Promise<boolean> {
    const survey = await this.findOne({ surveyId });
    if (survey.author.id !== adminId)
      throw new BadRequestException(
        '본인이 제작한 설문의 정보만 수정할 수 있습니다.',
      );

    let result: UpdateResult;
    if (survey.status !== SURVEY_STATUS.COMPLETE) {
      result = await this.surveyRespository.update(
        { id: surveyId },
        { status: SURVEY_STATUS.COMPLETE },
      );
    } else {
      throw new BadRequestException('이미 완료된 설문입니다.');
    }

    return result?.affected ? true : false;
  }

  async issuance({ adminId, surveyId }): Promise<boolean> {
    const survey = await this.findOne({ surveyId });
    if (survey.author.id !== adminId)
      throw new BadRequestException(
        '본인이 제작한 설문의 정보만 수정할 수 있습니다.',
      );

    if (
      survey.status === SURVEY_STATUS.ISSUANCE ||
      survey.status === SURVEY_STATUS.COMPLETE
    )
      throw new BadRequestException('이미 발행 혹은 완료된 설문입니다.');

    if (survey.questions.length < 1)
      throw new BadRequestException('각 설문은 최소 하나의 문항이 필요합니다.');

    const optionExist = survey.questions.filter((el) => el.options.length < 2);

    if (optionExist.length)
      throw new BadRequestException(
        '각 문항은 두 개 이상의 선택지가 필요합니다.',
      );

    const result = await this.surveyRespository.update(
      { id: adminId },
      { status: SURVEY_STATUS.ISSUANCE },
    );

    return result.affected ? true : false;
  }

  async cancellationIssue({ adminId, surveyId }): Promise<boolean> {
    const survey = await this.findOne({ surveyId });
    if (survey.author.id !== adminId)
      throw new BadRequestException(
        '본인이 제작한 설문의 정보만 수정할 수 있습니다.',
      );

    if (
      survey.status === SURVEY_STATUS.ISSUANCE ||
      survey.status === SURVEY_STATUS.COMPLETE
    )
      throw new BadRequestException(
        '아직 발행되지 않은 혹은 완료된 설문입니다.',
      );

    const result = await this.surveyRespository.update(
      { id: adminId },
      { status: SURVEY_STATUS.UNISSUED },
    );

    return result.affected ? true : false;
  }
}
