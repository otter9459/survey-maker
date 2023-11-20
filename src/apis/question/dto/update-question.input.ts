import { InputType, OmitType } from '@nestjs/graphql';
import { CreateQuestionInput } from './create-question.input';

@InputType()
export class UpdateQuestionInput extends OmitType(CreateQuestionInput, [
  'surveyId',
]) {}
