import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import { Admin } from './entity/admin.entity';
import { CreateAdminInput } from './dto/craete-admin.input';

@Resolver()
export class AdminResolver {
  constructor(
    private readonly adminService: AdminService, //
  ) {}

  @Query(() => String)
  hello() {
    return 'Hello world';
  }

  @Mutation(() => Admin)
  async createAdmin(
    @Args('createAdminInput') createAdminInput: CreateAdminInput,
  ) {
    return this.adminService.create({ createAdminInput });
  }
}
