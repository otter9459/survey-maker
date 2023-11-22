import { InputType, PickType } from '@nestjs/graphql';
import { Question } from '../entity/question.entity';

@InputType()
export class CreateQuestionInput extends PickType(
  Question,
  ['content', 'multiple'],
  InputType,
) {}
