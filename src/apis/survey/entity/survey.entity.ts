import { registerEnumType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';
import { Admin } from 'src/apis/admin/entity/admin.entity';
import { Question } from 'src/apis/question/entity/question.entity';
import { Response } from 'src/apis/response/entity/response.entity';
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
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Min(0)
  @Column({ type: 'decimal', precision: 10, scale: 1, default: 0.1 })
  version: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: SURVEY_STATUS, default: 'UNISSUED' })
  status: SURVEY_STATUS;

  @IsInt({ message: 'Target number must be an integer.' })
  @Min(1, { message: 'Target number must be greater than or equal to 1.' })
  @Column()
  target_number: number;

  @ManyToOne(() => Admin, (author) => author.surveys)
  author: Admin;

  @OneToMany(() => Question, (question) => question.survey)
  quesitons: Question[];

  @OneToMany(() => Response, (response) => response.survey)
  responses: Response[];
}
