import { Student } from '@prisma/client';

export class ExcelExamScoreDto {
  student: Student;
  scoreList: number[];

  constructor(student: Student, scoreList: number[]) {
    this.student = student;
    this.scoreList = scoreList;
  }
}
