import { Min } from 'class-validator';
import { Response } from 'src/apis/response/entity/response.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Min(0)
  @Column()
  age: number;

  @Column()
  gender: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Response, (response) => response.survey)
  responses: Response[];
}
