import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsNotEmpty()
  @MinLength(8)
  username: string;

  @Field()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  static of(username: string, password: string): CreateUserInput {
    return new CreateUserInput(username, password);
  }
}
