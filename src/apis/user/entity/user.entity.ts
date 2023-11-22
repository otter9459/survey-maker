import { IsInt, Min } from 'class-validator';
import { Response } from '../../response/entity/response.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum USER_GENDER {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NONE = 'NONE',
}

registerEnumType(USER_GENDER, {
  name: 'USER_GENDER',
});

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

  @Column({ type: 'enum', enum: USER_GENDER })
  @Field(() => USER_GENDER)
  gender: USER_GENDER;

  @Column()
  @Field(() => String)
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Response, (response) => response.survey)
  @Field(() => [Response], { nullable: true })
  responses: Response[];
}
