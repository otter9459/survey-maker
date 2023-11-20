import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateResponseInput {
  @Field(() => String)
  questionId: string;

  @Field(() => String)
  optionId: string;
}
