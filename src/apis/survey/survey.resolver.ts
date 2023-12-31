import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SurveyService } from './survey.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { Survey } from './entity/survey.entity';
import { IContext } from 'src/commons/interfaces/context';
import { CreateSurveyInput } from './dto/create-survey.input';
import { UpdateSurveyInput } from './dto/update-survey.input';
import {
  ICompleteSurveyReturn,
  ISurveyServiceReturn,
} from './interfaces/survey-return.interface';

@Resolver()
export class SurveyResolver {
  constructor(
    private readonly surveyService: SurveyService, //
  ) {}

  // 조회 관련 API
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
  @Query(() => ICompleteSurveyReturn)
  async fetchCompleteSurvey(
    @Args('surveyId') surveyId: string,
    @Args('version') version: number,
  ): Promise<ICompleteSurveyReturn> {
    return this.surveyService.fetchComplete({
      surveyId,
      version,
    });
  }

  // 생성 관련 API
  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Survey)
  async createSurvey(
    @Context() context: IContext, //
    @Args('createSurveyInput') createSurveyInput: CreateSurveyInput,
  ): Promise<Survey> {
    return this.surveyService.create({ context, createSurveyInput });
  }

  // 수정 관련 API
  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Boolean)
  async updateSurvey(
    @Args('surveyId') surveyId: string,
    @Args('updateSurveyInput') updateSurveyInput: UpdateSurveyInput,
  ): Promise<boolean> {
    return this.surveyService.update({
      surveyId,
      updateSurveyInput,
    });
  }

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Boolean)
  async manualCompleteSurvey(
    @Args('surveyId') surveyId: string,
  ): Promise<boolean> {
    return this.surveyService.manualComplete({
      surveyId,
    });
  }

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Boolean)
  async issuanceSurvey(
    @Args('surveyId') surveyId: string, //
  ): Promise<boolean> {
    return this.surveyService.issuance({
      surveyId,
    });
  }

  // 삭제 관련 API
  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Boolean)
  async deleteSurvey(
    @Context() context: IContext, //
    @Args('surveyId') surveyId: string,
  ): Promise<boolean> {
    return this.surveyService.delete({
      adminId: context.req.user.id,
      surveyId,
    });
  }
}
