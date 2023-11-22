import { Field, ObjectType } from '@nestjs/graphql';
import { Survey } from '../entity/survey.entity';

@ObjectType()
export class ISurveyServiceReturn extends Survey {
  @Field(() => Number)
  respondant: number;
}

@ObjectType()
export class OptionRatioEntry {
  @Field(() => String)
  option: string;

  @Field(() => Number)
  ratio: number;
}

@ObjectType()
export class OptionRatio {
  @Field(() => String)
  question: string;

  @Field(() => [OptionRatioEntry])
  ratios: OptionRatioEntry[];
}

@ObjectType()
export class ICompleteSurveyReturn {
  @Field(() => String)
  id: string;

  @Field(() => Number)
  version: number;

  @Field(() => String)
  title: string;

  @Field(() => [OptionRatio])
  optionRatio: OptionRatio[];

  @Field(() => Number)
  scoreAvg: number;
}
