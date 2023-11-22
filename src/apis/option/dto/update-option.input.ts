import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateOptionInput } from './create-option.input';

@InputType()
export class UpdateOptionInput extends PartialType(CreateOptionInput) {
  @Field(() => Number, { nullable: true })
  priority: number;
}
