import { Module } from '@nestjs/common';
import { OptionResolver } from './option.resolver';
import { OptionService } from './option.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Option } from './entity/option.entity';
import { QuestionModule } from '../question/question.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Option, //
    ]),
    QuestionModule,
  ],
  providers: [OptionResolver, OptionService],
})
export class OptionModule {}
