import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ResponseService } from './response.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { IContext } from 'src/commons/interfaces/context';
import { CreateResponseInput } from './dto/create-response.input';
import { Response } from './entity/response.entity';
import { UpdateResponseInput } from './dto/update-response.input';

@Resolver()
export class ResponseResolver {
  constructor(
    private readonly responseService: ResponseService, //
  ) {}

  @UseGuards(GqlAuthGuard('access'))
  @Query(() => Response)
  async fetchResponseOfMine(
    @Context() context: IContext,
    @Args('responseId') responseId: string,
  ): Promise<Response> {
    return this.responseService.fetchOne({
      userId: context.req.user.id,
      responseId,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Query(() => [Response])
  async fetchResponseOfMineList(
    @Context() context: IContext,
    @Args('page') page: number,
  ): Promise<Response[]> {
    return this.responseService.fetchAll({
      userId: context.req.user.id,
      page,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Response)
  async createResponse(
    @Context() context: IContext,
    @Args('surveyId') surveyId: string,
    @Args('createResponseInput', { type: () => [CreateResponseInput] })
    createResponseInput: CreateResponseInput[],
  ): Promise<Response> {
    return this.responseService.create({
      userId: context.req.user.id,
      surveyId,
      createResponseInput,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  async updateResponse(
    @Context() context: IContext,
    @Args('responseId') responseId: string,
    @Args('updateResponseInput', { type: () => [UpdateResponseInput] })
    updateResponseInput: UpdateResponseInput[],
  ): Promise<boolean> {
    return this.responseService.update({
      userId: context.req.user.id,
      responseId,
      updateResponseInput,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  async deleteResponse(
    @Context() context: IContext,
    @Args('responseId') responseId: string,
  ): Promise<boolean> {
    return this.responseService.delete({
      userId: context.req.user.id,
      responseId,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  async deleteResponseAllOfMine(
    @Context() context: IContext, //
  ): Promise<boolean> {
    return this.responseService.deleteAllOfMine({
      userId: context.req.user.id,
    });
  }

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Boolean)
  async deleteResponseAdmin(
    @Args('responseId') responseId: string, //
  ): Promise<boolean> {
    return this.responseService.adminDeleteResponse({ responseId });
  }
}
