import { Min } from 'class-validator';
import { ResponseDetail } from 'src/apis/responseDetail/entity/responseDetail.entity';
import { Survey } from 'src/apis/survey/entity/survey.entity';
import { User } from 'src/apis/user/entity/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Response {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  survey_title: string;

  @Min(0)
  @Column({ type: 'decimal', precision: 10, scale: 1, default: 0.1 })
  survey_version: number;

  @ManyToOne(() => Survey, (survey) => survey.responses)
  survey: Survey;

  @ManyToOne(() => User, (user) => user.responses)
  user: User;

  @OneToMany(() => ResponseDetail, (responseDetail) => responseDetail.response)
  responseDetails: ResponseDetail[];
}
