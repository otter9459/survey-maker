import { Module } from '@nestjs/common';
import { ResponseDetailResolver } from './response_detail.resolver';
import { ResponseDetailService } from './response_detail.service';

@Module({
  providers: [ResponseDetailResolver, ResponseDetailService]
})
export class ResponseDetailModule {}
