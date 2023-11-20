import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { CreateSurveyInput } from './create-survey.input';

@InputType()
export class UpdateSurveyInput extends PartialType(
  OmitType(CreateSurveyInput, ['target_number']),
) {}
