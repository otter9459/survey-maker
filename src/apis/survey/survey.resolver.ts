import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SurveyService } from './survey.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { Survey } from './entity/survey.entity';
import { IContext } from 'src/commons/interfaces/context';
import { CreateSurveyInput } from './dto/create-survey.input';
import { UpdateSurveyInput } from './dto/update-survey.input';
import { ISurveyServiceReturn } from './interfaces/answer-return.interface';

@Resolver()
export class SurveyResolver {
  constructor(
    private readonly surveyService: SurveyService, //
  ) {}

  @Query(() => Survey)
  async fetchSurvey(
    @Args('surveyId') surveyId: string, //
  ): Promise<ISurveyServiceReturn> {
    return this.surveyService.findOne({ surveyId });
  }

  @Query(() => [Survey])
  async fetchSurveyList(
    @Args('page') page: number, //
  ): Promise<ISurveyServiceReturn[]> {
    return this.surveyService.fetchList({ page });
  }

  @UseGuards(GqlAuthGuard('admin'))
  @Query(() => Survey)
  async fetchCompleteSurvey(
    @Context() context: IContext, //
    @Args('surveyId') surveyId: string,
    @Args('version') version: number,
  ) {
    // 미완성, 답변까지 모두 제작되면 진행 - feature#5 브랜치
    return this.surveyService.fetchComplete({
      adminId: context.req.user.id,
      surveyId,
      version,
    });
  }

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Survey)
  async createSurvey(
    @Context() context: IContext, //
    @Args('createSurveyInput') createSurveyInput: CreateSurveyInput,
  ): Promise<Survey> {
    return this.surveyService.create({ context, createSurveyInput });
  }

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Boolean)
  async updateSurvey(
    @Context() context: IContext, //
    @Args('updateSurveyInput') updateSurveyInput: UpdateSurveyInput,
  ): Promise<boolean> {
    return this.surveyService.update({
      adminId: context.req.user.id,
      updateSurveyInput,
    });
  }

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Boolean)
  async updateSurveyVersion(
    @Context() context: IContext, //
    @Args('surveyId') surveyId: string,
  ): Promise<boolean> {
    return this.surveyService.updateVersion({
      adminId: context.req.user.id,
      surveyId,
    });
  }

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Boolean)
  async manualCompleteSurvey(
    @Context() context: IContext, //
    @Args('surveyId') surveyId: string,
  ): Promise<boolean> {
    return this.surveyService.manualComplete({
      adminId: context.req.user.id,
      surveyId,
    });
  }

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Boolean)
  async issuanceSurvey(
    @Context() context: IContext, //
    @Args('surveyId') surveyId: string,
  ): Promise<boolean> {
    return this.surveyService.issuance({
      adminId: context.req.user.id,
      surveyId,
    });
  }
}
