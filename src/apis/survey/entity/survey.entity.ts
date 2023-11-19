import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';
import { Admin } from '../../admin/entity/admin.entity';
import { Question } from '../../question/entity/question.entity';
import { Response } from '../../response/entity/response.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum SURVEY_STATUS {
  UNISSUED = 'UNISSUED',
  ISSUANCE = 'ISSUANCE',
  COMPLETE = 'COMPLETE',
}

registerEnumType(SURVEY_STATUS, {
  name: 'SURVEY_STATUS',
});

@Entity()
@ObjectType()
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Min(0)
  @Column({ type: 'decimal', precision: 10, scale: 1, default: 0.1 })
  @Field(() => Number)
  version: number;

  @Column()
  @Field(() => String)
  title: string;

  @Column()
  @Field(() => String)
  description: string;

  @Column({ type: 'enum', enum: SURVEY_STATUS, default: 'UNISSUED' })
  @Field(() => SURVEY_STATUS)
  status: SURVEY_STATUS;

  @IsInt({ message: 'Target number must be an integer.' })
  @Min(1, { message: 'Target number must be greater than or equal to 1.' })
  @Column()
  @Field(() => Number)
  target_number: number;

  @ManyToOne(() => Admin, (author) => author.surveys, { onDelete: 'CASCADE' })
  @Field(() => Admin)
  author: Admin;

  @OneToMany(() => Question, (question) => question.survey)
  @Field(() => [Question], { nullable: true })
  quesitons: Question[];

  @OneToMany(() => Response, (response) => response.survey)
  @Field(() => [Response], { nullable: true })
  responses: Response[];
}
