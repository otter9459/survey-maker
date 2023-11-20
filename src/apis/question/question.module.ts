import { Module } from '@nestjs/common';
import { QuestionResolver } from './question.resolver';
import { QuestionService } from './question.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entity/question.entity';
import { SurveyModule } from '../survey/survey.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question, //
    ]),
    SurveyModule,
  ],
  providers: [QuestionResolver, QuestionService],
})
export class QuestionModule {}
