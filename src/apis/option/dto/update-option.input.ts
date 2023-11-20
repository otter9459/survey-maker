import { InputType, PartialType } from '@nestjs/graphql';
import { CreateOptionInput } from './create-option.input';

@InputType()
export class UpdateOptionInput extends PartialType(CreateOptionInput) {}
