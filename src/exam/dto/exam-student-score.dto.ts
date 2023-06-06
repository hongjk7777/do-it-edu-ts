import { Course, Student } from '@prisma/client';

export class ExamStudentScoreDto {
  student: Student;
  sum: number;
  ranking: number;
  distribution: string;
  scoreList: number[];
  seoulDept: string;
  yonseiDept: string;
  course: Course;

  constructor(
    student: Student,
    sum: number,
    scoreList: number[],
    seoulDept: string,
    yonseiDept: string,
    course: Course,
  ) {
    this.student = student;
    this.sum = sum;
    this.scoreList = scoreList;
    this.seoulDept = seoulDept;
    this.yonseiDept = yonseiDept;
    this.course = course;
  }

  static of(
    student: Student,
    sum: number,
    scoreList: number[],
    seoulDept: string,
    yonseiDept: string,
    course: Course,
  ) {
    return new ExamStudentScoreDto(
      student,
      sum,
      scoreList,
      seoulDept,
      yonseiDept,
      course,
    );
  }
}
