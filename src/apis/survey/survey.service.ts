import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Survey } from './entity/survey.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRespository: Repository<Survey>,
  ) {}

  async findOne({ surveyId }): Promise<Survey> {
    return this.surveyRespository.findOne({ where: { id: surveyId } });
  }

  async fetchList({ page }): Promise<Survey[]> {
    return this.surveyRespository.find({
      relations: ['questions', 'questions.options'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * 10,
      take: 10,
    });
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
}
