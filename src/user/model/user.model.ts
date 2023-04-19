import 'reflect-metadata';
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { UserRoleEnum } from '@prisma/client';
import { BaseModel } from '@common/model/base.model';
import { Student } from '@student/model/student.model';

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
