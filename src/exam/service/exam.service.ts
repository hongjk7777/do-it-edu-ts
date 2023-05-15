import { CreateExamScoreRuleInput } from '@exam/dto/create-exam-score-rule.input';
import { Injectable } from '@nestjs/common';
import { Exam } from '@prisma/client';
import { Exam as ExamModel } from '@exam/model/exam.model';
import { PrismaService } from 'nestjs-prisma';
import { CreateExamScoreInput } from '../dto/create-exam-score.input';
import { CreateExamInput } from '../dto/create-exam.input';

@Injectable()
export class ExamService {
  constructor(private prisma: PrismaService) {}

  async save(examDatas: CreateExamInput): Promise<Exam> {
    const examScoreList = this.createExamScoreList(examDatas);
    const examScoreRuleList = this.createExamScoreRuleList(examDatas);

    const savedExam = await this.upsertExam(
      examDatas,
      examScoreList,
      examScoreRuleList,
    );

    console.log(savedExam);

    await this.upsertExamScore(examScoreList, savedExam);
    await this.upsertExamScoreRule(examScoreRuleList, savedExam);

    return savedExam;
  }

  private async upsertExam(
    examDatas: CreateExamInput,
    examScoreList: CreateExamScoreInput[],
    examScoreRuleList: CreateExamScoreRuleInput[],
  ) {
    return await this.prisma.exam.upsert({
      where: {
        round_courseId: {
          round: examDatas.round,
          courseId: examDatas.courseId,
        },
      },
      update: {
        commonRound: examDatas.commonRound,
      },
      create: {
        round: examDatas.round,
        commonRound: examDatas.commonRound,
        courseId: examDatas.courseId,
        examScore: {
          create: examScoreList,
        },
        scoreRule: {
          create: examScoreRuleList,
        },
      },
    });
  }

  private async upsertExamScore(
    examScoreList: CreateExamScoreInput[],
    savedExam: Exam,
  ) {
    for (const examScore of examScoreList) {
      await this.prisma.examScore.upsert({
        where: {
          examId_problemNumber: {
            examId: savedExam.id,
            problemNumber: examScore.problemNumber,
          },
        },
        update: {
          problemNumber: examScore.problemNumber,
          maxScore: examScore.maxScore,
        },
        create: {
          problemNumber: examScore.problemNumber,
          maxScore: examScore.maxScore,
          exam: {
            connect: {
              id: savedExam.id,
            },
          },
        },
      });
    }
  }

  private async upsertExamScoreRule(
    examScoreRuleList: CreateExamScoreRuleInput[],
    savedExam: Exam,
  ) {
    for (const examScoreRule of examScoreRuleList) {
      await this.prisma.examScoreRule.upsert({
        where: {
          examId_problemNumber: {
            examId: savedExam.id,
            problemNumber: examScoreRule.problemNumber,
          },
        },
        update: {
          problemNumber: examScoreRule.problemNumber,
          scoreRule: examScoreRule.scoreRule,
        },
        create: {
          problemNumber: examScoreRule.problemNumber,
          scoreRule: examScoreRule.scoreRule,
          exam: {
            connect: {
              id: savedExam.id,
            },
          },
        },
      });
    }
  }

  private createExamScoreList(
    examDatas: CreateExamInput,
  ): CreateExamScoreInput[] {
    const examScoreList = [];

    for (const [index, maxScore] of examDatas.maxScores.entries()) {
      const examScore = new CreateExamScoreInput(index + 1, maxScore);
      examScoreList.push(examScore);
    }

    return examScoreList;
  }

  private createExamScoreRuleList(
    examDatas: CreateExamInput,
  ): CreateExamScoreRuleInput[] {
    const examScoreRuleList = [];

    for (const [index, scoreRule] of examDatas.scoreRule.entries()) {
      const examScoreRule = new CreateExamScoreRuleInput(index + 1, scoreRule);
      examScoreRuleList.push(examScoreRule);
    }

    return examScoreRuleList;
  }

  async findAllByCourseId(courseId: number): Promise<Exam[]> {
    const findExamList = await this.prisma.exam.findMany({
      where: { courseId: courseId },
      orderBy: [{ round: 'asc' }],
      include: {
        examScore: {
          orderBy: [
            {
              problemNumber: 'asc',
            },
          ],
        },
      },
    });

    return findExamList;
  }

  async findByRoundAndCourseId(round: number, courseId: number): Promise<Exam> {
    const findExam = await this.prisma.exam.findFirst({
      where: {
        round: round,
        courseId: courseId,
      },
      include: {
        examScore: {
          orderBy: [
            {
              problemNumber: 'asc',
            },
          ],
        },
      },
    });

    return findExam;
  }

  async findAllByCommonRound(commonRound: number): Promise<Exam[]> {
    const findExamList = await this.prisma.exam.findMany({
      where: { commonRound: commonRound },
      orderBy: [{ round: 'asc' }],
      include: {
        examScore: {
          orderBy: [
            {
              problemNumber: 'asc',
            },
          ],
        },
      },
    });

    return findExamList;
  }

  async findAllCommonExams(): Promise<Exam[]> {
    const findExamList = [];

    const commonRoundList = await this.prisma.exam.groupBy({
      where: {
        commonRound: {
          gt: 0,
        },
      },
      by: ['commonRound'],
    });

    for (const commonRound of commonRoundList) {
      const exam = await this.prisma.exam.findFirst({
        where: {
          commonRound: commonRound.commonRound,
        },
        include: {
          examScore: {
            orderBy: [
              {
                problemNumber: 'asc',
              },
            ],
          },
          scoreRule: {
            orderBy: [
              {
                problemNumber: 'asc',
              },
            ],
          },
        },
      });

      findExamList.push(exam);
    }

    return findExamList;
  }

  async deleteAllByCourseId(courseId: number): Promise<void> {
    await this.prisma.exam.deleteMany({
      where: { courseId: courseId },
    });
  }
}
