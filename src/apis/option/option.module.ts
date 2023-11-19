import { Module } from '@nestjs/common';
import { OptionResolver } from './option.resolver';
import { OptionService } from './option.service';

@Module({
  providers: [OptionResolver, OptionService]
})
export class OptionModule {}
