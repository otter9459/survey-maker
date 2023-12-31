import { Module } from '@nestjs/common';
import { ResponseDetailService } from './responseDetail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ResponseDetail,
  ResponseDetailOption,
} from './entity/responseDetail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResponseDetail, //
      ResponseDetailOption,
    ]),
  ],
  providers: [ResponseDetailService],
  exports: [ResponseDetailService],
})
export class ResponseDetailModule {}
