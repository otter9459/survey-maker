import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';
import { Question } from '../../question/entity/question.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OPTION_SCORE {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

registerEnumType(OPTION_SCORE, {
  name: 'OPTION_SCORE',
});

@Entity()
@ObjectType()
export class Option {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  content: string;

  @IsInt({ message: 'Target number must be an integer.' })
  @Min(0, { message: 'Target number must be greater than or equal to 0.' })
  @Column()
  @Field(() => Number)
  fixed_order: number;

  @Column({ type: 'enum', enum: OPTION_SCORE })
  @Field(() => OPTION_SCORE)
  score: OPTION_SCORE;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Question, (question) => question.options, {
    onDelete: 'CASCADE',
  })
  @Field(() => Question)
  question: Question;
}
