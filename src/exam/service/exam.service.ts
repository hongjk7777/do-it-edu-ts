import { Injectable } from '@nestjs/common';
import { Exam } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { CreateExamScoreInput } from '../dto/create-exam-score.input';
import { CreateExamInput } from '../dto/create-exam.input';

@Injectable()
export class ExamService {
  constructor(private prisma: PrismaService) {}

  async save(examDatas: CreateExamInput): Promise<Exam> {
    const examScoreList = this.createExamScoreList(examDatas);

    const savedExam = await this.upsertExam(examDatas, examScoreList);
    await this.upsertExamScore(examScoreList, savedExam);

    return savedExam;
  }

  private async upsertExam(
    examDatas: CreateExamInput,
    examScoreList: CreateExamScoreInput[],
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
        scoreRule: examDatas.scoreRule,
      },
      create: {
        round: examDatas.round,
        commonRound: examDatas.commonRound,
        courseId: examDatas.courseId,
        scoreRule: examDatas.scoreRule,
        examScore: {
          create: examScoreList,
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

  async deleteAllByCourseId(courseId: number): Promise<void> {
    await this.prisma.exam.deleteMany({
      where: { courseId: courseId },
    });
  }
}
