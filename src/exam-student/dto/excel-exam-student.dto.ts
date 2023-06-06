import { Field } from '@nestjs/graphql';

export class ExcelExamStudentDto {
  name: string;
  phoneNum: string;

  constructor(name: string, phoneNum: string) {
    this.name = name;
    this.phoneNum = phoneNum;
  }
}
