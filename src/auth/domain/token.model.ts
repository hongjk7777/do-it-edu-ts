import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJWT } from 'graphql-scalars';

@ObjectType()
export class Token {
  @Field(() => GraphQLJWT, { description: 'JWT access token' })
  accessToken: string;

  @Field(() => Int, { description: 'access token expiration time(second)' })
  expiresIn: number;

  @Field(() => GraphQLJWT, { description: 'JWT refresh token' })
  refreshToken: string;

  @Field(() => Int, { description: 'refresh token expiration time(second)' })
  refreshIn: number;

  @Field(() => String)
  userRole: string;
}
