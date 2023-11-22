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
      relations: [
        'user',
        'survey',
        'responseDetails',
        'responseDetails.option_content',
      ],
    });

    if (!responseData)
      throw new NotFoundException('해당 답변 정보가 존재하지 않습니다.');

    if (responseData.user.id !== userId)
      throw new BadRequestException('본인의 답변만 조회할 수 있습니다.');

    return responseData;
  }

  async fetchAll({ userId, page }): Promise<Response[]> {
    return await this.responseRepository.find({
      where: { user: { id: userId } },
      relations: ['survey'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * 10,
      take: 10,
    });
  }

  async create({ userId, surveyId, createResponseInput }): Promise<Response> {
    const survey = await this.surveyService.findOne({ surveyId });
    if (!survey)
      throw new NotFoundException('등록할 설문지의 정보가 존재하지 않습니다.');

    if (survey.status !== SURVEY_STATUS.ISSUANCE)
      throw new BadRequestException(
        '발행 상태가 아닌 설문은 참여할 수 없습니다.',
      );

    const isExist = await this.responseRepository.findOne({
      where: {
        survey: { id: surveyId },
        user: { id: userId },
        survey_version: survey.version,
      },
    });

    if (isExist) throw new BadRequestException('이미 참여한 설문입니다.');

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

      const optionData = [];

      el.optionId.forEach((id) => {
        if (!optionMap.has(id)) {
          throw new BadRequestException(
            '해당 설문지에 속하지 않은 선택지가 감지되었습니다.',
          );
        }

        optionData.push({
          content: optionMap.get(id)[0],
          score: optionMap.get(id)[1],
        });
      });

      if (el.optionId.length > 1 && !isMultiple) {
        throw new BadRequestException(
          '중복 답변이 허용되지 않는 문항이 있습니다.',
        );
      }

      return {
        question_content: questionMap.get(el.questionId)[0],
        multiple: isMultiple,
        option_content: optionData,
      };
    });

    const newResponse = this.responseRepository.create({
      user: userId,
      survey: surveyId,
    });

    let totalScore = 0;
    responseDetails.forEach((data) => {
      totalScore += data.option_content.reduce((acc, cur) => {
        return acc + cur.score;
      }, 0);
    });

    const completeReponseDetails =
      await this.responseDetailService.createResponseDetail({
        responseDetails,
      });

    if (survey.respondant - 1 === survey.target_number)
      this.surveyService.manualComplete({ surveyId });

    return this.responseRepository.save({
      ...newResponse,
      survey_title: survey.title,
      survey_version: survey.version,
      total_score: totalScore,
      responseDetails: completeReponseDetails,
    });
  }

  async update({ userId, responseId, updateResponseInput }): Promise<boolean> {
    const responseData = await this.responseRepository.findOne({
      where: { id: responseId },
      relations: [
        'user',
        'survey',
        'survey.questions',
        'survey.questions.options',
        'responseDetails',
      ],
    });

    if (!responseData)
      throw new NotFoundException('해당 답변 정보가 존재하지 않습니다.');

    if (responseData.user.id !== userId)
      throw new BadRequestException('본인의 답변만 수정할 수 있습니다.');

    if (responseData.survey_version !== responseData.survey.version)
      throw new BadRequestException(
        '설문지의 현재 버전과 답변 기록의 설문지 버전이 다르면 수정할 수 없습니다. 새로운 답변을 작성해 주세요.',
      );

    if (responseData.survey.status !== SURVEY_STATUS.ISSUANCE)
      throw new BadRequestException(
        '해당 설문지가 발행 상태가 아니기 때문에 수정이 불가능합니다.',
      );

    const savedResponseDetailIds = responseData.responseDetails.map(
      (el) => el.id,
    );

    const inputResponseDetailId = updateResponseInput.find(
      (el) => !savedResponseDetailIds.includes(el.responseDetailId),
    );

    if (inputResponseDetailId)
      throw new BadRequestException(
        '해당 답변 목록에 포함되지 않은 상세 답변 데이터가 입력 되었습니다.',
      );

    const optionMap = new Map();

    responseData.survey.questions.forEach((question) => {
      question.options.forEach((option) =>
        optionMap.set(option.id, [option.content, option.score]),
      );
    });

    const responseDetailMap = new Map();
    responseData.responseDetails.forEach((responseDetail) => {
      responseDetailMap.set(responseDetail.id, responseDetail.multiple);
    });

    const responseDetailUpdateData = updateResponseInput.flatMap((data) => {
      const isMultiple = responseDetailMap.get(data.responseDetailId);
      if (data.optionId.length > 1 && !isMultiple) {
        throw new BadRequestException(
          '중복 답변이 허용되지 않는 문항이 있습니다.',
        );
      }

      const result = data.optionId.map((el) => {
        const [optionContent, optionScore] = optionMap.get(el) || '';

        if (!optionContent)
          throw new BadRequestException(
            '해당 설문지에 속하지 않은 선택지가 감지되었습니다.',
          );

        return {
          content: optionContent,
          score: optionScore,
        };
      });

      return {
        id: data.responseDetailId,
        option_content: result,
      };
    });

    await this.responseDetailService.updateResponseDetail({
      responseDetailUpdateData,
    });

    const newResponseData = await this.responseRepository.findOne({
      where: { id: responseId },
      relations: ['responseDetails', 'responseDetails.option_content'],
    });

    let totalScore = 0;
    newResponseData.responseDetails.forEach((data) => {
      totalScore += data.option_content.reduce((acc, cur) => {
        return acc + cur.score;
      }, 0);
    });

    await this.responseRepository.update(
      { id: responseId },
      { total_score: totalScore },
    );

    return true;
  }

  async delete({ userId, responseId }): Promise<boolean> {
    const responseData = await this.responseRepository.findOne({
      where: { id: responseId },
      relations: ['user'],
    });

    if (responseData.user.id !== userId)
      throw new BadRequestException('본인의 답변만 삭제할 수 있습니다.');

    const result = await this.responseRepository.delete({ id: responseId });

    return result.affected ? true : false;
  }

  async deleteAllOfMine({ userId }): Promise<boolean> {
    const result = await this.responseRepository.delete({
      user: { id: userId },
    });

    return result.affected ? true : false;
  }

  async adminDeleteResponse({ responseId }): Promise<boolean> {
    const result = await this.responseRepository.delete({ id: responseId });

    return result.affected ? true : false;
  }
}
