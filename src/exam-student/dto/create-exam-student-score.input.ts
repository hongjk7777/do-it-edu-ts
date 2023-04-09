import { IsNotEmpty } from 'class-validator';

export class CreateExamStudentScoreInput {
  constructor(problemNumber: number, problemScore: number) {
    this.problemNumber = problemNumber;
    this.problemScore = problemScore;
  }

  @IsNotEmpty()
  problemNumber: number;

  @IsNotEmpty()
  problemScore: number;
}
