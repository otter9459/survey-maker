import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { OptionService } from './option.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { Option } from './entity/option.entity';

@Resolver()
export class OptionResolver {
  constructor(
    private readonly optionService: OptionService, //
  ) {}

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Option)
  async createOption(
    @Args('questionId') questionId: string, //
    @Args('createOptionInput') createOptionInput: CreateOptionInput,
  ): Promise<Option> {
    return this.optionService.create({ questionId, createOptionInput });
  }
}
