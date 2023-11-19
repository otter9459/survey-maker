import { Module } from '@nestjs/common';
import { ResponseDetailResolver } from './responseDetail.resolver';
import { ResponseDetailService } from './responseDetail.service';

@Module({
  providers: [ResponseDetailResolver, ResponseDetailService],
})
export class ResponseDetailModule {}
