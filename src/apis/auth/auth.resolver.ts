import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { IContext } from 'src/commons/interfaces/context';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService, //
  ) {}

  @Mutation(() => String)
  async loginAdmin(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    return this.authService.loginAdmin({ email, password });
  }

  @Mutation(() => String)
  async loginUser(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    return this.authService.loginUser({ email, password });
  }

  @Mutation(() => Boolean)
  async logoutUserAdmin(
    @Context() context: IContext, //
  ): Promise<boolean> {
    return this.authService.logout({ context });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  async resignUser(
    @Context() context: IContext, //
  ): Promise<boolean> {
    return this.authService.resignUser({ context });
  }

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Boolean)
  async resignAdmin(
    @Context() context: IContext, //
  ): Promise<boolean> {
    return this.authService.resignAdmin({ context });
  }
}
