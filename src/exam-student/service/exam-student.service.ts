import { SignupInput } from '@auth/input/signup.input';
import { AuthService } from '@auth/service/auth.service';
import { ExamStudentResponseDto } from '@exam-student/dto/exam-student-response.dto';
import { ExcelExamStudentDto } from '@exam-student/dto/excel-exam-student.dto';
import { StudentDeptRankingDto } from '@exam-student/dto/student-dept-ranking.dto';
import { StudentDeptDto } from '@exam-student/dto/student-dept.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Exam,
  ExamScore,
  ExamStudent,
  ExamStudentScore,
  Student,
} from '@prisma/client';
import { CreateStudentInput } from '@student/dto/create-student.input';
import { StudentService } from '@student/service/student.service';
import { UserService } from '@user/service/user.service';
import { PrismaService } from 'nestjs-prisma';
import { CreateExamStudentScoreInput } from '../dto/create-exam-student-score.input';
import { CreateExamStudentInput } from '../dto/create-exam-student.input';

@Injectable()
export class ExamStudentService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private studentService: StudentService,
  ) {}

  async saveWithScore(
    examStudentDatas: CreateExamStudentInput,
  ): Promise<ExamStudent> {
    const savedExamStudent = await this.upsertExamStudent(examStudentDatas);

    const examStudentScoreList = this.createExamStudnetScoreList(
      examStudentDatas.scores,
    );

    await this.upsertExamStudentScore(examStudentScoreList, savedExamStudent);

    return savedExamStudent;
  }

  async saveExcelExamStudent(
    excelExamStudentDto: ExcelExamStudentDto,
    courseId: number,
  ): Promise<Student> {
    if (excelExamStudentDto.phoneNum == '') {
      return;
    }

    let findUser = await this.prisma.user.findUnique({
      where: {
        username: excelExamStudentDto.phoneNum,
      },
    });

    if (findUser == null) {
      const newUser = SignupInput.of(excelExamStudentDto.phoneNum, '');
      findUser = await this.authService.signUpStudent(newUser);
    }

    const findStudent = await this.prisma.student.findUnique({
      where: {
        userId: findUser.id,
      },
    });

    if (findStudent == null) {
      const createStudentInput = CreateStudentInput.of(
        excelExamStudentDto.name,
        excelExamStudentDto.phoneNum,
        courseId,
      );
      return this.studentService.saveStudent(createStudentInput, findUser);
    }
  }

  async saveExamStudentList(
    excelExamStudentDtoList: ExcelExamStudentDto[],
    courseId: number,
  ) {
    const signupPromises = excelExamStudentDtoList.map((student) => {
      return this.saveExcelExamStudent(student, courseId);
    });

    await Promise.all(signupPromises);
  }

  async upsertExamStudent(examStudentDatas: CreateExamStudentInput) {
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
      const findExamStudentScore =
        await this.prisma.examStudentScore.findUnique({
          where: {
            examStudentId_problemNumber: {
              examStudentId: savedExamStudent.id,
              problemNumber: examStudentScore.problemNumber,
            },
          },
        });

      if (
        findExamStudentScore != null &&
        findExamStudentScore.problemScore == examStudentScore.problemScore
      ) {
        continue;
      }

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

  async findAllByStudentId(studentId: number) {
    const findExamStudentList = await this.prisma.examStudent.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        examStudentScore: true,
        student: true,
        exam: {
          include: {
            examScore: true,
          },
        },
      },
      orderBy: [{ exam: { round: 'asc' } }],
    });

    return await this.addExamData(findExamStudentList);
  }

  private async addExamData(
    findExamStudentList: (ExamStudent & {
      examStudentScore: ExamStudentScore[];
      student: Student;
      exam: Exam & { examScore: ExamScore[] };
    })[],
  ) {
    const examStudentResponseDtoList: ExamStudentResponseDto[] = [];

    for (const examStudent of findExamStudentList) {
      const examStudentList = await this.findAllByExamId(examStudent.examId);

      const scoreSum = this.calcSum(examStudent.examStudentScore);
      const studentAmount = examStudentList.length;
      const average = this.calcAverage(examStudentList);
      const subAverageList = this.calcSubAverageList(examStudentList);
      const variance = this.calcVariance(examStudentList, average);
      const stdDev = Math.sqrt(variance);
      const ranking = this.calcRanking(scoreSum, examStudentList);
      const rankingList = this.calcRankingList(examStudentList);
      const seoulDeptRankingList = this.calcSeoulDeptRankingList(
        scoreSum,
        examStudentList,
      );
      const yonseiDeptRankingList = this.calcYonseiDeptRankingList(
        scoreSum,
        examStudentList,
      );
      const subHighestScoreList = this.calcSubHighestScoreList(examStudentList);
      const highestScore = examStudentList.reduce(
        (max, cur) => Math.max(max, this.calcSum(cur.examStudentScore)),
        0,
      );

      const examStudentResponseDto = new ExamStudentResponseDto(
        examStudent.examStudentScore,
        examStudent.exam,
        examStudent.seoulDept,
        examStudent.yonseiDept,
        studentAmount,
        average,
        stdDev,
        highestScore,
        ranking,
        rankingList,
        subAverageList,
        subHighestScoreList,
        seoulDeptRankingList,
        yonseiDeptRankingList,
      );

      examStudentResponseDtoList.push(examStudentResponseDto);
    }
    return examStudentResponseDtoList;
  }

  private calcRankingList(
    examStudentList: (ExamStudent & {
      examStudentScore: ExamStudentScore[];
    })[],
  ) {
    const rankingList = Array(10).fill(0);

    examStudentList.forEach((examStudent) => {
      const score = this.calcSum(examStudent.examStudentScore);

      const index = Math.floor(score == 50 ? (score - 1) / 5 : score / 5);

      rankingList[index]++;
    });

    return rankingList;
  }

  private calcSeoulDeptRankingList(
    scoreSum: number,
    examStudentList: (ExamStudent & {
      examStudentScore: ExamStudentScore[];
    })[],
  ) {
    const studentDeptRankingDtoList: StudentDeptRankingDto[] = [];

    const deptList: string[] = this.extractSeoulDeptList(examStudentList);

    deptList.forEach((dept) => {
      const filteredList = examStudentList.filter((examStudent) => {
        return examStudent.seoulDept.trim() == dept;
      });

      const rank = this.calcRanking(scoreSum, filteredList);
      const rankingList = this.calcRankingList(filteredList);
      const studentAmount = filteredList.length;

      studentDeptRankingDtoList.push(
        new StudentDeptRankingDto(dept, rank, studentAmount, rankingList),
      );
    });

    return studentDeptRankingDtoList;
  }
  extractSeoulDeptList(
    examStudentList: (ExamStudent & { examStudentScore: ExamStudentScore[] })[],
  ): string[] {
    const deptList: string[] = [];

    examStudentList.forEach((examStudent) => {
      const dept = examStudent.seoulDept.trim();

      if (dept != null && dept != '') {
        if (!deptList.includes(dept)) {
          deptList.push(dept);
        }
      }
    });

    return deptList;
  }

  private calcYonseiDeptRankingList(
    scoreSum: number,
    examStudentList: (ExamStudent & {
      examStudentScore: ExamStudentScore[];
    })[],
  ) {
    const studentDeptRankingDtoList: StudentDeptRankingDto[] = [];

    const deptList: string[] = this.extractYonseiDeptList(examStudentList);

    deptList.forEach((dept) => {
      const filteredList = examStudentList.filter((examStudent) => {
        return examStudent.yonseiDept.trim() == dept;
      });

      const rank = this.calcRanking(scoreSum, filteredList);
      const rankingList = this.calcRankingList(filteredList);
      const studentAmount = filteredList.length;

      studentDeptRankingDtoList.push(
        new StudentDeptRankingDto(dept, rank, studentAmount, rankingList),
      );
    });

    return studentDeptRankingDtoList;
  }
  extractYonseiDeptList(
    examStudentList: (ExamStudent & { examStudentScore: ExamStudentScore[] })[],
  ): string[] {
    const deptList: string[] = [];

    examStudentList.forEach((examStudent) => {
      const dept = examStudent.yonseiDept.trim();

      if (dept != null && dept != '') {
        if (!deptList.includes(dept)) {
          deptList.push(dept);
        }
      }
    });

    return deptList;
  }

  private calcAverage(examStudentList) {
    const totalSum = examStudentList.reduce(
      (sum, cur) => sum + this.calcSum(cur.examStudentScore),
      0,
    );

    return totalSum / examStudentList.length;
  }

  private calcSubAverageList(examStudentList) {
    const subAverageList = [];

    for (const [
      index,
      examStudent,
    ] of examStudentList[0].examStudentScore.entries()) {
      const sum = examStudentList.reduce(
        (sum, cur) => sum + cur.examStudentScore[index].problemScore,
        0,
      );

      subAverageList.push(sum / examStudentList.length);
    }

    return subAverageList;
  }

  calcSubHighestScoreList(
    examStudentList: (ExamStudent & {
      examStudentScore: ExamStudentScore[];
      student: import('.prisma/client').Student;
    })[],
  ) {
    const subHighestScoreList = [];

    for (const [
      index,
      examStudent,
    ] of examStudentList[0].examStudentScore.entries()) {
      const subHighestScore = examStudentList.reduce(
        (sum, cur) => Math.max(sum, cur.examStudentScore[index].problemScore),
        0,
      );

      subHighestScoreList.push(subHighestScore);
    }

    return subHighestScoreList;
  }

  private calcSum(examStudentScoreList: ExamStudentScore[]) {
    return examStudentScoreList.reduce((sum, cur) => sum + cur.problemScore, 0);
  }

  private calcVariance(examStudentList, average: number) {
    const totalSum = examStudentList.reduce(
      (sum, cur) => sum + (this.calcSum(cur.examStudentScore) - average) ** 2,
      0,
    );

    const variance = totalSum / examStudentList.length;
    return variance;
  }

  private calcRanking(curScoreSum: number, examStudentList) {
    examStudentList.sort((a, b) => {
      return (
        this.calcSum(b.examStudentScore) - this.calcSum(a.examStudentScore)
      );
    });

    const rankingData = examStudentList.reduce(
      (acc, data, index) => {
        const scoreSum = this.calcSum(data.examStudentScore);

        if (scoreSum !== acc.lastScore) {
          acc.sameCount = 0;
        }

        if (curScoreSum === scoreSum) {
          acc.ranking = index + 1 - acc.sameCount;
        }

        acc.sameCount++;
        acc.lastScore = scoreSum;

        return acc;
      },
      { sameCount: 0, lastScore: -1, ranking: 0 },
    );

    return rankingData.ranking;
  }

  async findAllByExamId(examId: number) {
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

  async updateStudentDept(studentDeptDto: StudentDeptDto) {
    const examStudent = await this.prisma.examStudent.findUnique({
      where: {
        examId_studentId: {
          examId: studentDeptDto.exam.id,
          studentId: studentDeptDto.student.id,
        },
      },
    });

    if (examStudent != null) {
      await this.prisma.examStudent.update({
        where: {
          id: examStudent.id,
        },
        data: {
          seoulDept: studentDeptDto.seoulDept,
          yonseiDept: studentDeptDto.yonseiDept,
        },
      });
    }
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

  async deleteAllExamStudentScoreByExamStudentId(examStudentId: number) {
    await this.prisma.examStudentScore.deleteMany({
      where: { examStudentId: examStudentId },
    });
  }
}
