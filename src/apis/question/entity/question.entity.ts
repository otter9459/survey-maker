import { IsInt, Min } from 'class-validator';
import { Option } from '../../option/entity/option.entity';
import { Survey } from '../../survey/entity/survey.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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
  @Min(1, { message: 'Target number must be greater than or equal to 1.' })
  @Column({ nullable: true, default: null })
  @Field(() => Number, { nullable: true })
  priority: number;

  @Column({ default: false })
  @Field(() => Boolean)
  multiple: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Survey, (survey) => survey.questions, {
    onDelete: 'CASCADE',
  })
  @Field(() => Survey)
  survey: Survey;

  @OneToMany(() => Option, (option) => option.question)
  @Field(() => [Option], { nullable: true })
  options: Option[];
}
