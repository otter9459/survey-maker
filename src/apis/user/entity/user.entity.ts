import { Min } from 'class-validator';
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

  @Min(0)
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
  @Field(() => String)
  password: string;

  @OneToMany(() => Response, (response) => response.survey)
  @Field(() => [Response], { nullable: true })
  responses: Response[];
}
