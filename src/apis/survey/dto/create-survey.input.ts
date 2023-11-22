import { Field, InputType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class CreateSurveyInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @IsInt({ message: 'Target number must be an integer.' })
  @Min(1, { message: 'Target number must be greater than or equal to 1.' })
  @Field(() => Number)
  target_number: number;
}
