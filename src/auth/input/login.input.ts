import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsNotEmpty()
  @MinLength(4)
  username: string;

  @Field()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}
