import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question } from './entity/question.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CreateQuestionInput } from './dto/create-question.input';

@Resolver()
export class QuestionResolver {
  constructor(
    private readonly questionService: QuestionService, //
  ) {}

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Question)
  async createQuestion(
    @Args('createQuestionInput') createQuestionInput: CreateQuestionInput,
  ): Promise<Question> {
    return this.questionService.create({ createQuestionInput });
  }
}
