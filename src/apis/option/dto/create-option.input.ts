import { Field, InputType, PickType } from '@nestjs/graphql';
import { OPTION_SCORE, Option } from '../entity/option.entity';

@InputType()
export class CreateOptionInput extends PickType(
  Option,
  ['content'],
  InputType,
) {
  @Field(() => OPTION_SCORE)
  score: OPTION_SCORE;
}
