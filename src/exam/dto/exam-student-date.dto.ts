import { Course, Student } from '@prisma/client';

export class ExamStudentDateDto {
  student: Student;
  sum: number;
  ranking: number;
  distribution: string;
  scoreList: number[];
  seoulDept: string;
  yonseiDept: string;
  course: Course;
  updatedAt: string;

  constructor(
    student: Student,
    sum: number,
    scoreList: number[],
    seoulDept: string,
    yonseiDept: string,
    course: Course,
    updatedAt: string,
  ) {
    this.student = student;
    this.sum = sum;
    this.scoreList = scoreList;
    this.seoulDept = seoulDept;
    this.yonseiDept = yonseiDept;
    this.course = course;
    this.updatedAt = updatedAt;
  }

  static of(
    student: Student,
    sum: number,
    scoreList: number[],
    seoulDept: string,
    yonseiDept: string,
    course: Course,
    updatedAt: string,
  ) {
    return new ExamStudentDateDto(
      student,
      sum,
      scoreList,
      seoulDept,
      yonseiDept,
      course,
      updatedAt,
    );
  }
}
