import { IsInt, Min } from 'class-validator';
import { Option } from '../../option/entity/option.entity';
import { Survey } from '../../survey/entity/survey.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class Question {
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

  @Column({ default: false })
  @Field(() => Boolean)
  multiple: boolean;

  @ManyToOne(() => Survey, (survey) => survey.questions, {
    onDelete: 'CASCADE',
  })
  @Field(() => Survey)
  survey: Survey;

  @OneToMany(() => Option, (option) => option.question)
  @Field(() => [Option], { nullable: true })
  options: Option[];
}
