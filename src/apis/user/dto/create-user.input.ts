import { Field, InputType, OmitType } from '@nestjs/graphql';
import { User } from '../entity/user.entity';

@InputType()
export class CreateUserInput extends OmitType(
  User,
  ['id', 'responses'],
  InputType,
) {
  @Field(() => String)
  password: string;
}
