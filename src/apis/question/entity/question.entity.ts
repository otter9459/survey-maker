import { IsInt, Min } from 'class-validator';
import { Option } from 'src/apis/option/entity/option.entity';
import { Survey } from 'src/apis/survey/entity/survey.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @IsInt({ message: 'Target number must be an integer.' })
  @Min(1, { message: 'Target number must be greater than or equal to 1.' })
  @Column()
  fixed_order: number;

  @Column({ default: false })
  redundant: boolean;

  @ManyToOne(() => Survey, (survey) => survey.quesitons)
  survey: Survey;

  @OneToMany(() => Option, (option) => option.question)
  options: Option[];
}
