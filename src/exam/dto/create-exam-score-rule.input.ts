import { IsNotEmpty } from 'class-validator';

export class CreateExamScoreRuleInput {
  constructor(problemNumber: number, scoreRule: string) {
    this.problemNumber = problemNumber;
    this.scoreRule = scoreRule;
  }

  @IsNotEmpty()
  problemNumber: number;

  scoreRule: string;
}
