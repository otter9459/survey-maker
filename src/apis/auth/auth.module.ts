import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from '../admin/admin.module';
import { JwtAdminStrategy } from './strategies/jwt-admin.strategy';

@Module({
  imports: [
    JwtModule.register({}), //
    AdminModule,
  ],
  providers: [
    AuthResolver, //
    AuthService,
    JwtAdminStrategy,
  ],
})
export class AuthModule {}
