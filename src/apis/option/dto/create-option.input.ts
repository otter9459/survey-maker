import { InputType, PickType } from '@nestjs/graphql';
import { Option } from '../entity/option.entity';

@InputType()
export class CreateOptionInput extends PickType(
  Option,
  ['content', 'fixed_order', 'score'],
  InputType,
) {}
