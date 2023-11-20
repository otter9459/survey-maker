import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
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
  @Query(() => Question)
  async fetchQuestion(
    @Args('questionId') questionId: string,
  ): Promise<Question> {
    return this.questionService.fetchOne({ questionId });
  }

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Question)
  async createQuestion(
    @Args('createQuestionInput') createQuestionInput: CreateQuestionInput,
  ): Promise<Question> {
    return this.questionService.create({ createQuestionInput });
  }

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Boolean)
  async updateQuestion(
    @Args('questionId') questionId: string,
    @Args('updateQuestionInput') updateQuestionInput: UpdateQuestionInput,
  ) {
    return this.questionService.update({ updateQuestionInput });
  }
}
