import { Field, ObjectType } from '@nestjs/graphql';
import { Survey } from '../entity/survey.entity';

@ObjectType()
export class ISurveyServiceReturn extends Survey {
  @Field(() => Number)
  respondant: number;
}
