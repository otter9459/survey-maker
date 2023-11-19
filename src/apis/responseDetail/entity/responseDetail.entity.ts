import { OPTION_SCORE } from 'src/apis/option/entity/option.entity';
import { Response } from 'src/apis/response/entity/response.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ResponseDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  question_content: string;

  @Column()
  option_content: string;

  @Column({ type: 'enum', enum: OPTION_SCORE })
  score: number;

  @ManyToOne(() => Response, (response) => response.responseDetails)
  response: Response;
}
