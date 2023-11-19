import { Field, ObjectType } from '@nestjs/graphql';
import { OPTION_SCORE } from '../../option/entity/option.entity';
import { Response } from '../../response/entity/response.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class ResponseDetail {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  question_content: string;

  @Column()
  @Field(() => String)
  option_content: string;

  @Column({ type: 'enum', enum: OPTION_SCORE })
  @Field(() => OPTION_SCORE)
  score: OPTION_SCORE;

  @ManyToOne(() => Response, (response) => response.responseDetails)
  @Field(() => Response)
  response: Response;
}
