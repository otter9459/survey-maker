import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import { Admin } from './entity/admin.entity';
import { CreateAdminInput } from './dto/craete-admin.input';
import { IContext } from 'src/commons/interfaces/context';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@Resolver()
export class AdminResolver {
  constructor(
    private readonly adminService: AdminService, //
  ) {}

  @UseGuards(GqlAuthGuard('admin'))
  @Query(() => Admin)
  async fetchAdmin(
    @Context() context: IContext, //
  ): Promise<Admin> {
    return this.adminService.findOne({ id: context.req.user.id });
  }

  @Mutation(() => Admin)
  async createAdmin(
    @Args('createAdminInput') createAdminInput: CreateAdminInput,
  ): Promise<Admin> {
    return this.adminService.create({ createAdminInput });
  }

  @UseGuards(GqlAuthGuard('admin'))
  @Mutation(() => Boolean)
  async updateAdminPassword(
    @Context() context: IContext, //
    @Args('currentPassword') currentPassword: string,
    @Args('newPassword') newPassword: string,
  ): Promise<boolean> {
    return this.adminService.updatePassword({
      email: context.req.user.email,
      currentPassword,
      newPassword,
    });
  }
}
