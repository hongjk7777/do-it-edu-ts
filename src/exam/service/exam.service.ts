import { CreateExamScoreRuleInput } from '@exam/dto/create-exam-score-rule.input';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Exam } from '@prisma/client';
import { Exam as ExamModel } from '@exam/model/exam.model';
import { PrismaService } from 'nestjs-prisma';
import { CreateExamScoreInput } from '../dto/create-exam-score.input';
import { CreateExamInput } from '../dto/create-exam.input';
import { UpsertScoreRuleInput } from '@exam/dto/update-exam-info.input';
import { UpdateExamScoreInput } from '@exam/dto/update-exam-score.input';

@Injectable()
export class ExamService {
  constructor(private prisma: PrismaService) {}

  async save(examDatas: CreateExamInput): Promise<Exam> {
    const examScoreList = this.createExamScoreList(examDatas);
    // const examScoreRuleList = this.createExamScoreRuleList(examDatas);

    const savedExam = await this.upsertExam(examDatas, examScoreList);

    await this.upsertExamScore(examScoreList, savedExam);
    // await this.upsertExamScoreRule(examScoreRuleList, savedExam);

    return savedExam;
  }

  private async getCurRound(courseId: number) {
    const exam = await this.prisma.exam.findFirst({
      where: {
        courseId: courseId,
      },
      orderBy: {
        round: 'desc',
      },
    });

    if (!exam) {
      return 0;
    }

    return exam.round;
  }

  private async getCurCommonRound(courseId: number) {
    const exam = await this.prisma.exam.findFirst({
      where: {
        courseId: courseId,
      },
      orderBy: {
        commonRound: 'desc',
      },
    });

    if (!exam) {
      return 0;
    }

    return exam.commonRound;
  }

  private async upsertExam(
    examDatas: CreateExamInput,
    examScoreList: CreateExamScoreInput[],
  ) {
    const nextRound = (await this.getCurRound(examDatas.courseId)) + 1;
    const nextCommonRound =
      (await this.getCurCommonRound(examDatas.courseId)) + 1;

    const savedExam = await this.prisma.exam.create({
      data: {
        round: nextRound,
        commonRound: examDatas.isCommonRound ? nextCommonRound : 0,
        course: {
          connect: {
            id: examDatas.courseId,
          },
        },
        examScore: {
          create: examScoreList,
        },
      },
    });

    if (!savedExam) {
      throw new NotFoundException('시험 업데이트 중 오류가 발생했습니다.');
    }

    return savedExam;
  }

  async upsertExamScore(
    examScoreList: CreateExamScoreInput[],
    savedExam: Exam,
  ) {
    for (const examScore of examScoreList) {
      const upsertedExamScore = await this.prisma.examScore.upsert({
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

      if (!upsertedExamScore) {
        throw new NotFoundException('시험 업데이트 중 오류가 발생했습니다.');
      }
    }
  }

  async updateExamScore(updateExamScoreInput: UpdateExamScoreInput) {
    const scoreList = updateExamScoreInput.scoreList;
    const updateScoreList = [];

    for (let index = 0; index < scoreList.length; index++) {
      const score = scoreList[index];

      const examScore = await this.prisma.examScore.update({
        where: {
          examId_problemNumber: {
            examId: updateExamScoreInput.examId,
            problemNumber: index + 1,
          },
        },
        data: {
          maxScore: score,
        },
      });

      if (!examScore) {
        throw new NotFoundException('해당하는 시험 문제를 찾지 못했습니다.');
      }

      updateScoreList.push(examScore);
    }

    return updateScoreList;
  }

  async upsertExamScoreRule(upsertScoreRuleInput: UpsertScoreRuleInput) {
    const scoreRuleList = upsertScoreRuleInput.scoreRuleList;
    const updateScoreRuleList = [];

    const examScore = await this.findExamScore(upsertScoreRuleInput);

    for (let index = 0; index < scoreRuleList.length; index++) {
      const scoreRule = scoreRuleList[index];

      const upesertedScoreRule = await this.prisma.examScoreRule.upsert({
        where: {
          examScoreId_subProblemNumber: {
            examScoreId: examScore.id,
            subProblemNumber: index + 1,
          },
        },
        update: {
          scoreRule: scoreRule,
        },
        create: {
          subProblemNumber: index + 1,
          scoreRule: scoreRule,
          examScore: {
            connect: {
              id: examScore.id,
            },
          },
        },
      });

      if (!upesertedScoreRule) {
        throw new NotFoundException('시험 업데이트 중 오류가 발생했습니다.');
      }

      updateScoreRuleList.push(upesertedScoreRule);
    }

    return updateScoreRuleList;
  }

  private async findExamScore(upsertScoreRuleInput: UpsertScoreRuleInput) {
    const examScore = await this.prisma.examScore.findUnique({
      where: {
        examId_problemNumber: {
          examId: upsertScoreRuleInput.examId,
          problemNumber: upsertScoreRuleInput.problemNumber,
        },
      },
    });

    if (!examScore) {
      throw new NotFoundException('존재하지 않는 시험입니다.');
    }

    return examScore;
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
