import { Args, Context, Resolver } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question } from './entity/question.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { IContext } from 'src/commons/interfaces/context';

@Resolver()
export class QuestionResolver {
  constructor(
    private readonly questionService: QuestionService, //
  ) {}

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Question)
  async createQuestion(
    @Context() context: IContext, //
    @Args('createQuestionInput') createQuestionInput: CreateQuestionInput,
  ) {
    return this.questionService.create({
      adminId: context.req.user.id,
      createQuestionInput,
    });
  }
}
