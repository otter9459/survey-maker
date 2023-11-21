import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SURVEY_STATUS, Survey } from './entity/survey.entity';
import { Not, Repository } from 'typeorm';
import {
  ICompleteSurveyReturn,
  ISurveyServiceReturn,
} from './interfaces/survey-return.interface';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRespository: Repository<Survey>,
  ) {}

  async findOne({ surveyId }): Promise<ISurveyServiceReturn> {
    const result = await this.surveyRespository.findOne({
      where: { id: surveyId },
      relations: ['author', 'questions', 'questions.options', 'responses'],
    });

    return { ...result, respondant: result.responses.length };
  }

  async fetchList({ page }): Promise<ISurveyServiceReturn[]> {
    const results = await this.surveyRespository.find({
      relations: ['author', 'questions', 'questions.options', 'responses'],
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

  async fetchComplete({ surveyId, version }): Promise<ICompleteSurveyReturn> {
    const survey = await this.findOne({ surveyId });

    if (version > survey.version)
      throw new ForbiddenException('해당 버전은 존재하지 않습니다.');

    if (survey.status !== SURVEY_STATUS.COMPLETE && version === survey.version)
      throw new ForbiddenException('해당 설문은 완료되지 않았습니다.');

    const list = await this.surveyRespository.findOne({
      where: { id: surveyId, responses: { survey_version: version } },
      relations: [
        'responses',
        'responses.responseDetails',
        'responses.responseDetails.option_content',
      ],
    });

    const optionCount = new Map();
    list.responses.forEach((el) => {
      el.responseDetails.forEach((ele) => {
        if (!optionCount.has(ele.question_content))
          optionCount.set(ele.question_content, {});
        const count = optionCount.get(ele.question_content);
        ele.option_content.forEach((element) => {
          if (!count[element.content]) count[element.content] = 1;
          else count[element.content]++;
        });
        optionCount.set(ele.question_content, count);
      });
    });

    const searchedVersion = list.responses[0].survey_version;
    const searchedTitle = list.responses[0].survey_title;
    const searchedOptionsCount = [];
    optionCount.forEach((val, key) => {
      const ratios = [];
      for (const num in val) {
        const avg = Math.floor((val[num] / optionCount.size) * 100);
        ratios.push({ option: num, ratio: avg });
      }
      searchedOptionsCount.push({ question: key, ratios: ratios });
    });
    const searchedScoreAverage = (
      list.responses.reduce((acc, cur) => {
        return acc + cur.total_score;
      }, 0) / list.responses.length
    ).toFixed(1);

    return {
      id: surveyId,
      version: searchedVersion,
      title: searchedTitle,
      optionRatio: searchedOptionsCount,
      scoreAvg: searchedScoreAverage,
    };
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
      author: context.req.user.id,
    });
  }

  async update({ surveyId, updateSurveyInput }): Promise<boolean> {
    const { title, target_number } = updateSurveyInput;
    const survey = await this.findOne({ surveyId });

    if (title) {
      const isExist = await this.surveyRespository.find({
        where: { title, id: Not(surveyId) },
      });

      if (isExist.length) {
        throw new ConflictException('같은 제목의 설문이 존재합니다.');
      }
    }

    if (survey.respondant <= target_number) {
      throw new BadRequestException(
        '변경하려는 목표 응답자 수보다 현재 응답자 수가 많습니다.',
      );
    }

    if (survey.status === SURVEY_STATUS.COMPLETE) {
      throw new BadRequestException(
        '완료된 설문은 수정이 불가능합니다. 설문지 버전 업데이트 후 재시도 해주세요.',
      );
    } else if (survey.status === SURVEY_STATUS.ISSUANCE && survey.respondant) {
      throw new BadRequestException(
        '발행된 설문에 참여자가 존재하는 경우 내용을 수정할 수 없습니다. 설문을 종료, 버전 업데이트 후 재시도 해주세요.',
      );
    }

    const result = await this.surveyRespository.update(
      { id: surveyId },
      { ...updateSurveyInput },
    );

    return result.affected ? true : false;
  }

  async updateVersion({ surveyId }): Promise<boolean> {
    const survey = await this.findOne({ surveyId });

    if (survey.status === SURVEY_STATUS.ISSUANCE && survey.respondant) {
      throw new BadRequestException(
        '발행된 설문에 참여자가 존재하는 경우 버전을 변경할 수 없습니다. 설문을 종료해 주세요.',
      );
    } else if (survey.status === SURVEY_STATUS.COMPLETE) {
      await this.surveyRespository.update(
        { id: surveyId },
        {
          status: SURVEY_STATUS.UNISSUED,
          version: Number(survey.version) + 0.1,
        },
      );
    } else {
      await this.surveyRespository.save({
        id: surveyId,
        version: Number(survey.version) + 0.1,
      });
    }

    return true;
  }

  async manualComplete({ surveyId }): Promise<boolean> {
    const survey = await this.findOne({ surveyId });

    if (survey.status === SURVEY_STATUS.COMPLETE) {
      throw new BadRequestException('이미 완료된 설문입니다.');
    }
    if (survey.status === SURVEY_STATUS.UNISSUED) {
      throw new BadRequestException('발행되지 않은 설문입니다.');
    }

    const result = await this.surveyRespository.update(
      { id: surveyId },
      { status: SURVEY_STATUS.COMPLETE },
    );

    return result?.affected ? true : false;
  }

  async issuance({ surveyId }): Promise<boolean> {
    const survey = await this.findOne({ surveyId });

    if (survey.status === SURVEY_STATUS.ISSUANCE)
      throw new BadRequestException('이미 발행되어 있는 설문입니다.');

    if (survey.questions.length < 1)
      throw new BadRequestException('각 설문은 최소 하나의 문항이 필요합니다.');

    const optionExist = survey.questions.filter((el) => el.options.length < 2);

    if (optionExist.length)
      throw new BadRequestException(
        '각 문항은 두 개 이상의 선택지가 필요합니다.',
      );

    const result = await this.surveyRespository.update(
      { id: surveyId },
      { status: SURVEY_STATUS.ISSUANCE, version: Number(survey.version) + 0.1 },
    );

    return result.affected ? true : false;
  }

  async delete({ adminId, surveyId }): Promise<boolean> {
    const survey = await this.findOne({ surveyId });
    if (survey.author.id !== adminId)
      throw new BadRequestException(
        '본인이 제작한 설문의 정보만 삭제할 수 있습니다.',
      );

    const result = await this.surveyRespository.softDelete({ id: surveyId });

    return result.affected ? true : false;
  }
}
