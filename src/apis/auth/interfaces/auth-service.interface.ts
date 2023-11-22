import { Admin } from 'src/apis/admin/entity/admin.entity';
import { User } from 'src/apis/user/entity/user.entity';

export interface IAuthServiceGetAccessToken {
  user: User | Admin;
  key: string;
  keyid: string;
}
