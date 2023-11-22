import { Module } from '@nestjs/common';
import { ResponseResolver } from './response.resolver';
import { ResponseService } from './response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Response } from './entity/response.entity';
import { SurveyModule } from '../survey/survey.module';
import { ResponseDetailModule } from '../responseDetail/responseDetail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Response, //
    ]),
    SurveyModule,
    ResponseDetailModule,
  ],
  providers: [ResponseResolver, ResponseService],
})
export class ResponseModule {}
