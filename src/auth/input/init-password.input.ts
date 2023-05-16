import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class InitPasswordInput {
  @Field()
  @IsNotEmpty()
  @MinLength(8)
  username: string;
}
