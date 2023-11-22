import { Field, InputType, OmitType } from '@nestjs/graphql';
import { CreateResponseInput } from './create-response.input';

@InputType()
export class UpdateResponseInput extends OmitType(CreateResponseInput, [
  'questionId',
]) {
  @Field(() => String)
  responseDetailId: string;
}
