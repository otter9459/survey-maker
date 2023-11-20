import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { OptionService } from './option.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { Option } from './entity/option.entity';
import { CreateOptionInput } from './dto/create-option.input';
import { UpdateOptionInput } from './dto/update-option.input';

@Resolver()
export class OptionResolver {
  constructor(
    private readonly optionService: OptionService, //
  ) {}

  @UseGuards(GqlAuthGuard('admin'))
  @Query(() => Option)
  async fetchOption(
    @Args('optionId') optionId: string, //
  ): Promise<Option> {
    return this.optionService.fetchOne({ optionId });
  }

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Option)
  async createOption(
    @Args('questionId') questionId: string, //
    @Args('createOptionInput') createOptionInput: CreateOptionInput,
  ): Promise<Option> {
    return this.optionService.create({ questionId, createOptionInput });
  }

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Boolean)
  async updateOption(
    @Args('optionId') optionId: string,
    @Args('updateOptionInput') updateOptionInput: UpdateOptionInput,
  ): Promise<boolean> {
    return this.optionService.update({ optionId, updateOptionInput });
  }

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Boolean)
  async deleteOption(
    @Args('optionId') optionId: string, //
  ): Promise<boolean> {
    return this.optionService.delete({ optionId });
  }
}
