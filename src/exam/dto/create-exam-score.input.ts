import { IsNotEmpty } from 'class-validator';

export class CreateExamScoreInput {
  constructor(problemNumber: number, maxScore: number) {
    this.problemNumber = problemNumber;
    this.maxScore = maxScore;
  }

  @IsNotEmpty()
  problemNumber: number;

  @IsNotEmpty()
  maxScore: number;
}
