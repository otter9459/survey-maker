import { Field, ObjectType } from '@nestjs/graphql';
import { Survey } from '../../survey/entity/survey.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  name: string;

  @Column()
  @Field(() => String)
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Survey, (survey) => survey.author)
  @Field(() => [Survey], { nullable: true })
  surveys: Survey[];
}
