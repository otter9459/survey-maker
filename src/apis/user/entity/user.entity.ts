import { IsInt, Min } from 'class-validator';
import { Response } from '../../response/entity/response.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  name: string;

  @IsInt({ message: 'Target number must be an integer.' })
  @Min(1, { message: 'Target number must be greater than or equal to 1.' })
  @Column()
  @Field(() => Number)
  age: number;

  @Column()
  @Field(() => String)
  gender: string;

  @Column()
  @Field(() => String)
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Response, (response) => response.survey)
  @Field(() => [Response], { nullable: true })
  responses: Response[];
}
