import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class SignupInput {
  @Field()
  @IsNotEmpty()
  @MinLength(4)
  username: string;

  @Field()
  @IsNotEmpty()
  @MinLength(4)
  password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  static of(username: string, password: string) {
    return new SignupInput(username, password);
  }
}
