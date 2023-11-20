import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { ResponseService } from './response.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { IContext } from 'src/commons/interfaces/context';

@Resolver()
export class ResponseResolver {
  constructor(
    private readonly responseService: ResponseService, //
  ) {}

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  async createResponse(
    @Context() context: IContext,
    @Args('createResponseInput') createResponseInput: CreateResponseInput,
  ): Promise<boolean> {
    return this.responseService.create({
      userId: context.req.user.id,
      createResponseInput,
    });
  }
}
