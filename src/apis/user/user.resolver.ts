import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { IContext } from 'src/commons/interfaces/context';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService, //
  ) {}

  @UseGuards(GqlAuthGuard('access'))
  @Query(() => User)
  async fetchUser(
    @Context() context: IContext, //
  ): Promise<User> {
    return this.userService.findOne({ id: context.req.user.id });
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput, //
  ): Promise<User> {
    return this.userService.create({ createUserInput });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  async updateUser(
    @Context() context: IContext, //
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<boolean> {
    return this.userService.update({
      userId: context.req.user.id,
      updateUserInput,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  async updateUserPassword(
    @Context() context: IContext, //
    @Args('currentPassword') currentPassword: string,
    @Args('newPassword') newPassword: string,
  ): Promise<boolean> {
    return this.userService.updatePassword({
      email: context.req.user.email,
      currentPassword,
      newPassword,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  async resignUser(
    @Context() context: IContext, //
  ): Promise<boolean> {
    return this.userService.resign({ id: context.req.user.id });
  }
}
