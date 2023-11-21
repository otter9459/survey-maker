import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from './entity/response.entity';
import { Repository } from 'typeorm';
import { SurveyService } from '../survey/survey.service';
import { ResponseDetailService } from '../responseDetail/responseDetail.service';
import { SURVEY_STATUS } from '../survey/entity/survey.entity';

@Injectable()
export class ResponseService {
  constructor(
    @InjectRepository(Response)
    private readonly responseRepository: Repository<Response>,

    private readonly surveyService: SurveyService,
    private readonly responseDetailService: ResponseDetailService,
  ) {}

  async fetchOne({ userId, responseId }): Promise<Response> {
    const responseData = await this.responseRepository.findOne({
      where: { id: responseId },
      relations: ['user', 'responseDetails'],
    });

    if (!responseData)
      throw new NotFoundException('해당 답변 정보가 존재하지 않습니다.');

    if (responseData.user.id !== userId)
      throw new BadRequestException('본인의 답변만 조회할 수 있습니다.');

    return responseData;
  }

  async create({ userId, surveyId, createResponseInput }): Promise<Response> {
    const survey = await this.surveyService.findOne({ surveyId });
    if (!survey)
      throw new NotFoundException('등록할 설문지의 정보가 존재하지 않습니다.');

    if (survey.status !== SURVEY_STATUS.ISSUANCE)
      throw new BadRequestException(
        '발행 상태가 아닌 설문은 참여할 수 없습니다.',
      );

    const isOptionEmpty = createResponseInput.find(
      (el) => el.optionId.length === 0,
    );

    if (survey.questions.length !== createResponseInput.length || isOptionEmpty)
      throw new BadRequestException(
        '모든 문항에 대해 최소 하나의 선택지는 골라야 합니다.',
      );

    const questionMap = new Map();
    const optionMap = new Map();

    survey.questions.forEach((question) => {
      questionMap.set(question.id, [question.content, question.multiple]),
        question.options.forEach((option) =>
          optionMap.set(option.id, [option.content, option.score]),
        );
    });

    const responseDetails = createResponseInput.flatMap((el) => {
      const [questionContent, isMultiple] =
        questionMap.get(el.questionId) || [];

      if (!questionContent) {
        throw new BadRequestException(
          '해당 설문지에 속하지 않은 문항이 감지되었습니다.',
        );
      }
      el.optionId.forEach((id) => {
        if (!optionMap.has(id)) {
          throw new BadRequestException(
            '해당 설문지에 속하지 않은 선택지가 감지되었습니다.',
          );
        }
      });

      if (el.optionId.length > 1 && !isMultiple) {
        throw new BadRequestException(
          '중복 답변이 허용되지 않는 문항이 있습니다.',
        );
      }

      return el.optionId.map((id) => {
        return {
          question_content: questionMap.get(el.questionId)[0],
          option_content: optionMap.get(id)[0],
          score: optionMap.get(id)[1],
        };
      });
    });

    const newResponse = this.responseRepository.create({
      user: userId,
      survey: surveyId,
    });

    const totalScore = responseDetails.reduce((acc, cur) => {
      return acc + cur.score;
    }, 0);

    const completeReponseDetails =
      await this.responseDetailService.createResponseDetail({
        responseDetails,
      });

    return this.responseRepository.save({
      ...newResponse,
      survey_title: survey.title,
      survey_version: survey.version,
      total_score: totalScore,
      responseDetails: completeReponseDetails,
    });
  }
}
