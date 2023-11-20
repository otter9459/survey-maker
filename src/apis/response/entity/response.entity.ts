import { Min } from 'class-validator';
import { ResponseDetail } from '../../responseDetail/entity/responseDetail.entity';
import { Survey } from '../../survey/entity/survey.entity';
import { User } from '../../user/entity/user.entity';
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
export class Response {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  survey_title: string;

  @Min(0)
  @Column({ type: 'decimal', precision: 10, scale: 1, default: 0.1 })
  @Field(() => Number)
  survey_version: number;

  @ManyToOne(() => Survey, (survey) => survey.responses, {
    onDelete: 'CASCADE',
  })
  @Field(() => Survey)
  survey: Survey;

  @ManyToOne(() => User, (user) => user.responses)
  @Field(() => User)
  user: User;

  @OneToMany(() => ResponseDetail, (responseDetail) => responseDetail.response)
  @Field(() => [ResponseDetail], { nullable: true })
  responseDetails: ResponseDetail[];
}
