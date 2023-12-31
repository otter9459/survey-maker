import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './apis/admin/admin.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AuthModule } from './apis/auth/auth.module';
import { SurveyModule } from './apis/survey/survey.module';
import { QuestionModule } from './apis/question/question.module';
import { OptionModule } from './apis/option/option.module';
import { UserModule } from './apis/user/user.module';
import { ResponseModule } from './apis/response/response.module';
import { ResponseDetailModule } from './apis/responseDetail/responseDetail.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    AdminModule,
    AuthModule,
    OptionModule,
    QuestionModule,
    ResponseModule,
    ResponseDetailModule,
    SurveyModule,
    UserModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/commons/graphql/schema.gql'),
    }),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      entities: [__dirname + '/apis/**/*.entity.*'],
      synchronize: true,
      logging: true,
      retryAttempts: 30,
    }),
    CacheModule.register({
      store: redisStore,
      url: 'redis://redis-server:6379',
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
