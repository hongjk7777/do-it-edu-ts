import { Exam, ExamStudent, ExamStudentScore, Student } from '@prisma/client';

export interface ExamWithStudent extends Exam {
  examStudent: (ExamStudent & {
    student: Student;
    examStudentScore: ExamStudentScore[];
  })[];
}
