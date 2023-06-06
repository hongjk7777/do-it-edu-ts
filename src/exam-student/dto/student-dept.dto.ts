import { Exam, Student } from '@prisma/client';

export class StudentDeptDto {
  student: Student;
  exam: Exam;
  seoulDept: string;
  yonseiDept: string;
  commonRound: number;

  constructor(
    student: Student,
    exam: Exam,
    seoulDept: string,
    yonseiDept: string,
    commonRound: number,
  ) {
    this.student = student;
    this.exam = exam;
    this.seoulDept = seoulDept;
    this.yonseiDept = yonseiDept;
    this.commonRound = commonRound;
  }
}
