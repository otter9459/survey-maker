import { InputType, PartialType } from '@nestjs/graphql';
import { CreateResponseInput } from './create-response.input';

@InputType()
export class UpdateResponseInput extends PartialType(CreateResponseInput) {}
