import { registerEnumType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';
import { Question } from 'src/apis/question/entity/question.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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
export class Option {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @IsInt({ message: 'Target number must be an integer.' })
  @Min(1, { message: 'Target number must be greater than or equal to 1.' })
  @Column()
  fixed_order: number;

  @Column({ type: 'enum', enum: OPTION_SCORE })
  score: OPTION_SCORE;

  @ManyToOne(() => Question, (question) => question.options)
  question: Question;
}
