import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ResponseService } from './response.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { IContext } from 'src/commons/interfaces/context';
import { CreateResponseInput } from './dto/create-response.input';
import { Response } from './entity/response.entity';

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
}
