import { User } from '.prisma/client';

export default class UserInfo {
  id: number;
  username: string;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
  }
}
