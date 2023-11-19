import { Field, InputType, OmitType } from '@nestjs/graphql';
import { CreateSurveyInput } from './create-survey.input';

@InputType()
export class UpdateSurveyInput extends OmitType(CreateSurveyInput, [
  'target_number',
]) {
  @Field(() => String)
  id: string;
}
