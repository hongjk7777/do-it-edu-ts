import { ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/model/user.moel';
import { Token } from './token.model';

@ObjectType()
export class Auth extends Token {
  user: User;
}
