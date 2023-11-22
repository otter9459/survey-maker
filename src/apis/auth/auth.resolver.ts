import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { IContext } from 'src/commons/interfaces/context';

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
}
