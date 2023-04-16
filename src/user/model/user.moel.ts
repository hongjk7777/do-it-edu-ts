import 'reflect-metadata';
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { BaseModel } from 'src/common/model/base.model';
import { Student } from 'src/student/model/student.model';
import { UserRoleEnum } from '@prisma/client';

registerEnumType(UserRoleEnum, {
  name: 'Role',
  description: 'User role',
});

@ObjectType()
export class User extends BaseModel {
  @Field()
  username: string;

  @Field(() => [Student], { nullable: true })
  student?: [Student];

  @Field(() => UserRoleEnum)
  role: UserRoleEnum;
}
