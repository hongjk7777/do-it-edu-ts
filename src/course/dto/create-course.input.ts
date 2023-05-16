import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateCourseInput {
  @Field({ nullable: true })
  id: number;

  @Field()
  @IsNotEmpty()
  name: string;
}
