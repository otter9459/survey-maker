import { Module } from '@nestjs/common';
import { ResponseResolver } from './response.resolver';
import { ResponseService } from './response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Response } from './entity/response.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Response, //
    ]),
  ],
  providers: [ResponseResolver, ResponseService],
})
export class ResponseModule {}
