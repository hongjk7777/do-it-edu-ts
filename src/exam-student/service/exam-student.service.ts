import { Injectable, NotFoundException } from '@nestjs/common';
import { ExamStudent } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { CreateExamStudentScoreInput } from '../dto/create-exam-student-score.input';
import { CreateExamStudentInput } from '../dto/create-exam-student.input';

@Injectable()
export class ExamStudentService {
  constructor(private prisma: PrismaService) {}

  async save(examStudentDatas: CreateExamStudentInput): Promise<ExamStudent> {
    const savedExamStudent = await this.upsertExamStudent(examStudentDatas);

    const examStudentScoreList = this.createExamStudnetScoreList(
      examStudentDatas.scores,
    );

    await this.upsertExamStudentScore(examStudentScoreList, savedExamStudent);

    return savedExamStudent;
  }

  private async upsertExamStudent(examStudentDatas: CreateExamStudentInput) {
    const examStudent = await this.prisma.examStudent.upsert({
      where: {
        examId_studentId: {
          examId: examStudentDatas.examId,
          studentId: examStudentDatas.studnetId,
        },
      },

      update: {
        seoulDept: examStudentDatas.seoulDept,
        yonseiDept: examStudentDatas.yonseiDept,
      },

      create: {
        exam: {
          connect: {
            id: examStudentDatas.examId,
          },
        },
        student: {
          connect: {
            id: examStudentDatas.studnetId,
          },
        },
        seoulDept: examStudentDatas.seoulDept,
        yonseiDept: examStudentDatas.yonseiDept,
      },
    });

    if (!examStudent) {
      throw new NotFoundException('학생 성적 입력 중 오류가 발생했습니다.');
    }

    return examStudent;
  }

  private async upsertExamStudentScore(
    examStudentScoreList: CreateExamStudentScoreInput[],
    savedExamStudent: ExamStudent,
  ) {
    for (const examStudentScore of examStudentScoreList) {
      const upsertExamStudentScore = await this.prisma.examStudentScore.upsert({
        where: {
          examStudentId_problemNumber: {
            examStudentId: savedExamStudent.id,
            problemNumber: examStudentScore.problemNumber,
          },
        },
        update: {
          problemNumber: examStudentScore.problemNumber,
          problemScore: examStudentScore.problemScore,
        },
        create: {
          problemNumber: examStudentScore.problemNumber,
          problemScore: examStudentScore.problemScore,
          examStudent: {
            connect: {
              id: savedExamStudent.id,
            },
          },
        },
      });

      if (!upsertExamStudentScore) {
        throw new NotFoundException('학생 성적 입력 중 오류가 발생했습니다.');
      }
    }
  }

  private createExamStudnetScoreList(
    scores: number[],
  ): CreateExamStudentScoreInput[] {
    const examStudentScoreList = [];
    for (const [index, score] of scores.entries()) {
      const examStudentScore = new CreateExamStudentScoreInput(
        index + 1,
        score,
      );

      examStudentScoreList.push(examStudentScore);
    }

    return examStudentScoreList;
  }

  async findOneByExamIdAndStudentId(
    examId: number,
    studentId: number,
  ): Promise<ExamStudent> {
    const findExamStudent = await this.prisma.examStudent.findUnique({
      where: {
        examId_studentId: {
          examId: examId,
          studentId: studentId,
        },
      },
      include: {
        examStudentScore: true,
      },
    });

    if (!findExamStudent) {
      throw new NotFoundException('성적 확인 중 오류가 발생했습니다.');
    }

    return findExamStudent;
  }

  async findAllByStudentId(studentId: number): Promise<ExamStudent[]> {
    const findExamStudentList = await this.prisma.examStudent.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        examStudentScore: true,
        student: true,
      },
    });

    return findExamStudentList;
  }

  async findAllByExamId(examId: number): Promise<ExamStudent[]> {
    const findExamStudentList = await this.prisma.examStudent.findMany({
      where: {
        examId: examId,
      },
      include: {
        examStudentScore: true,
        student: true,
      },
    });

    return findExamStudentList;
  }

  async findAllBySeoulDept(seoulDept: string): Promise<ExamStudent[]> {
    const findExamStudentList = await this.prisma.examStudent.findMany({
      where: {
        seoulDept: seoulDept,
      },
      include: {
        examStudentScore: true,
        student: true,
      },
    });

    return findExamStudentList;
  }

  async findAllByYonseiDept(yonseiDept: string): Promise<ExamStudent[]> {
    const findExamStudentList = await this.prisma.examStudent.findMany({
      where: {
        yonseiDept: yonseiDept,
      },
      include: {
        examStudentScore: true,
        student: true,
      },
    });

    return findExamStudentList;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.examStudent.delete({ where: { id: id } });
  }

  async deleteAllByExamId(examId: number): Promise<void> {
    await this.prisma.examStudent.deleteMany({
      where: { examId: examId },
    });
  }
}
