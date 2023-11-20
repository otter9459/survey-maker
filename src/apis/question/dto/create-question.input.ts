import { Field, InputType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class CreateQuestionInput {
  @Field(() => String)
  content: string;

  @IsInt({ message: 'Target number must be an integer.' })
  @Min(0, { message: 'Target number must be greater than or equal to 0.' })
  @Field(() => Number)
  fixed_order: number;

  @Field(() => Boolean)
  multiple: boolean;
}
