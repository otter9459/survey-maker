import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { SurveyService } from './survey.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { Survey } from './entity/survey.entity';
import { IContext } from 'src/commons/interfaces/context';
import { CreateSurveyInput } from './dto/create-survey.input';

@Resolver()
export class SurveyResolver {
  constructor(
    private readonly surveyService: SurveyService, //
  ) {}

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Survey)
  async createSurvey(
    @Context() context: IContext, //
    @Args('createSurveyInput') createSurveyInput: CreateSurveyInput,
  ): Promise<Survey> {
    return this.surveyService.create({ context, createSurveyInput });
  }
}
