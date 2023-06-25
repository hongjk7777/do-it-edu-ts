import ExamErrorMsg from '@common/exception/ExamErrorMsg';
import { ExamStudentService } from '@exam-student/service/exam-student.service';
import { CreateExamScoreRuleInput } from '@exam/dto/create-exam-score-rule.input';
import { DeleteExamScoreRuleInput } from '@exam/dto/delete-exam-score-rule.input';
import { ExamResponseDto } from '@exam/dto/exam-response.dto';
import { ExamStudentScoreDto } from '@exam/dto/exam-student-score.dto';
import { ExamWithStudent } from '@exam/dto/exam-with-student.interface';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CommonExamScoreRule,
  Exam,
  ExamScore,
  ExamScoreRule,
  ExamStudent,
  ExamStudentScore,
} from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { CreateExamScoreInput } from '../dto/create-exam-score.input';
import { CreateExamInput } from '../dto/create-exam.input';

@Injectable()
export class ExamService {
  constructor(private prisma: PrismaService) {}

  async save(
    round: number,
    commonRound: number,
    courseId: number,
  ): Promise<Exam> {
    const savedExam = await this.prisma.exam.create({
      data: {
        round: round,
        commonRound: commonRound,
        course: {
          connect: {
            id: courseId,
          },
        },
      },
    });

    return savedExam;
  }

  async saveExamDatas(examDatas: CreateExamInput): Promise<Exam> {
    const examScoreList = this.createExamScoreList(examDatas);
    const examScoreRuleList = this.createExamScoreRuleList(examDatas);

    const savedExam = await this.upsertExam(examDatas, examScoreList);

    await this.upsertExamScore(examScoreList, savedExam);
    await this.upsertExamScoreRuleList(examScoreRuleList, savedExam.id);

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
    // const upsertedExam = await this.prisma.exam.upsert({
    //   where: {
    //     round_courseId: {
    //       round: nextRound,
    //       courseId: examDatas.courseId,
    //     },
    //   },
    //   update: {
    //     commonRound: examDatas.commonRound,
    //   },
    //   create: {
    //     round: examDatas.round,
    //     commonRound: examDatas.commonRound,
    //     courseId: examDatas.courseId,
    //     examScore: {
    //       create: examScoreList,
    //     },
    //     scoreRule: {
    //       create: examScoreRuleList,
    //     },
    //   },
    // });

    if (!savedExam) {
      throw new NotFoundException('시험 업데이트 중 오류가 발생했습니다.');
    }

    return savedExam;
  }

  private async upsertExamScore(
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

  private async upsertExamScoreRuleList(
    examScoreRuleList: CreateExamScoreRuleInput[],
    examId: number,
  ) {
    for (const examScoreRule of examScoreRuleList) {
      await this.upsertExamScoreRule(examId, examScoreRule);
    }
  }

  async upsertExamScoreRule(
    examId: number,
    examScoreRule: CreateExamScoreRuleInput,
  ) {
    const examScoreRuleList: ExamScoreRule[] = [];

    for (const [index, subScoreRule] of examScoreRule.scoreRule.entries()) {
      const subProblemNumber = index + 1;
      const upesertedExamScoreRule = await this.prisma.examScoreRule.upsert({
        where: {
          examId_problemNumber_subProblemNumber: {
            examId: examId,
            problemNumber: examScoreRule.problemNumber,
            subProblemNumber: subProblemNumber,
          },
        },
        update: {
          problemNumber: examScoreRule.problemNumber,
          subProblemNumber: subProblemNumber,
          scoreRule: subScoreRule,
        },
        create: {
          problemNumber: examScoreRule.problemNumber,
          subProblemNumber: subProblemNumber,
          scoreRule: subScoreRule,
          exam: {
            connect: {
              id: examId,
            },
          },
        },
      });

      if (!upesertedExamScoreRule) {
        throw new NotFoundException('시험 업데이트 중 오류가 발생했습니다.');
      }

      examScoreRuleList.push(upesertedExamScoreRule);
    }

    return examScoreRuleList;
  }

  private async upsertCommonExamScoreRuleList(
    examScoreRuleList: CreateExamScoreRuleInput[],
    round: number,
  ) {
    for (const examScoreRule of examScoreRuleList) {
      await this.upsertCommonExamScoreRule(round, examScoreRule);
    }
  }

  async upsertCommonExamScoreRule(
    round: number,
    examScoreRule: CreateExamScoreRuleInput,
  ) {
    const examScoreRuleList: CommonExamScoreRule[] = [];

    for (const [index, subScoreRule] of examScoreRule.scoreRule.entries()) {
      const subProblemNumber = index + 1;
      const upesertedExamScoreRule =
        await this.prisma.commonExamScoreRule.upsert({
          where: {
            round_problemNumber_subProblemNumber: {
              round: round,
              problemNumber: examScoreRule.problemNumber,
              subProblemNumber: subProblemNumber,
            },
          },
          update: {
            problemNumber: examScoreRule.problemNumber,
            subProblemNumber: subProblemNumber,
            scoreRule: subScoreRule,
          },
          create: {
            problemNumber: examScoreRule.problemNumber,
            subProblemNumber: subProblemNumber,
            scoreRule: subScoreRule,
            round: round,
          },
        });

      if (!upesertedExamScoreRule) {
        throw new NotFoundException('시험 업데이트 중 오류가 발생했습니다.');
      }

      examScoreRuleList.push(upesertedExamScoreRule);
    }

    return examScoreRuleList;
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
      const examScoreRule = new CreateExamScoreRuleInput(index + 1, ['']);
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
        scoreRule: {
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

  async findAllInfoByCourseId(courseId: number): Promise<ExamResponseDto[]> {
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
        scoreRule: {
          orderBy: [
            {
              problemNumber: 'asc',
            },
          ],
        },
        examStduent: {
          include: {
            examStudentScore: true,
          },
        },
      },
    });
    return this.addExamData(findExamList);
  }

  private async addExamData(
    findExamList: (Exam & {
      scoreRule: ExamScoreRule[];
      examScore: ExamScore[];
      examStduent: (ExamStudent & {
        examStudentScore: ExamStudentScore[];
      })[];
    })[],
  ) {
    const examStudentResponseDtoList: ExamResponseDto[] = [];

    for (const exam of findExamList) {
      const studentAmount = exam.examStduent.length;
      const average = this.calcAverage(exam.examStduent);
      const highestScore = exam.examStduent.reduce(
        (max, cur) => Math.max(max, this.calcSum(cur.examStudentScore)),
        0,
      );

      const examStudentResponseDto = new ExamResponseDto(
        exam,
        studentAmount,
        average,
        highestScore,
      );

      examStudentResponseDtoList.push(examStudentResponseDto);
    }
    return examStudentResponseDtoList;
  }

  private calcAverage(examStudentList) {
    const totalSum = examStudentList.reduce(
      (sum, cur) => sum + this.calcSum(cur.examStudentScore),
      0,
    );

    return totalSum / examStudentList.length;
  }

  private calcSum(examStudentScoreList: ExamStudentScore[]) {
    return examStudentScoreList.reduce((sum, cur) => sum + cur.problemScore, 0);
  }

  async findByCommonRoundAndCourseId(commonRound: number, courseId: number) {
    return await this.prisma.exam.findFirst({
      where: {
        commonRound: commonRound,
        courseId: courseId,
      },
    });
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
        scoreRule: {
          orderBy: [
            {
              problemNumber: 'asc',
            },
            {
              subProblemNumber: 'asc',
            },
          ],
        },
      },
    });

    return findExam;
  }

  async findAllByCommonRound(
    commonRound: number,
  ): Promise<ExamStudentScoreDto[]> {
    const findExamList = await this.prisma.exam.findMany({
      where: { commonRound: commonRound },
      orderBy: [{ round: 'asc' }],
      include: {
        examStduent: {
          include: {
            student: {
              include: {
                course: true,
              },
            },
            examStudentScore: {
              select: {
                problemNumber: true,
                problemScore: true,
              },
              orderBy: [
                {
                  problemNumber: 'asc',
                },
              ],
            },
          },
        },
      },
    });

    const examStudentScoreList: ExamStudentScoreDto[] = [];

    findExamList.forEach((findExam) => {
      const examStudentList = findExam.examStduent;

      examStudentList.forEach((examStudent) => {
        let sum = 0;
        const scoreList = [];
        examStudent.examStudentScore.forEach((score) => {
          sum += score.problemScore;
          scoreList.push(score.problemScore);
        });

        examStudentScoreList.push(
          ExamStudentScoreDto.of(
            examStudent.student,
            sum,
            scoreList,
            examStudent.seoulDept,
            examStudent.yonseiDept,
            examStudent.student.course,
          ),
        );
      });
    });

    return examStudentScoreList;
  }

  private sortExamList(examList: ExamStudentScoreDto[]) {
    return examList.sort((a, b) => {
      return b.sum - a.sum;
    });
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

  async findAllCommonExamScoreRule(): Promise<CommonExamScoreRule[]> {
    const commonExamScoreRuleList =
      await this.prisma.commonExamScoreRule.findMany({
        where: {},
        distinct: ['round'],
        orderBy: {
          round: 'asc',
        },
      });

    if (commonExamScoreRuleList == null) {
      throw new NotFoundException(ExamErrorMsg.NO_SCORE_RULE);
    }

    return commonExamScoreRuleList;
  }

  async findCommonExamScoreRuleByRound(
    round: number,
  ): Promise<CommonExamScoreRule[]> {
    const commonExamScoreRule = await this.prisma.commonExamScoreRule.findMany({
      where: {
        round: round,
      },
    });

    if (commonExamScoreRule == null) {
      throw new NotFoundException(ExamErrorMsg.NO_SCORE_RULE);
    }

    return commonExamScoreRule;
  }

  async deleteLastExamByCourseId(courseId: number): Promise<void> {
    const maxRoundExam = await this.prisma.exam.findFirst({
      where: {
        courseId: courseId,
      },
      orderBy: {
        round: 'desc',
      },
    });

    await this.prisma.examStudent.deleteMany({
      where: { examId: maxRoundExam.id },
    });
    await this.deleteExamScoreRuleByExamId(maxRoundExam.id);
    await this.deleteExamScoreByExamId(maxRoundExam.id);

    await this.prisma.exam.delete({
      where: { id: maxRoundExam.id },
    });
  }

  async deleteAllByCourseId(courseId: number): Promise<void> {
    await this.prisma.exam.deleteMany({
      where: { courseId: courseId },
    });
  }

  async deleteExamScoreByExamId(examId: number) {
    await this.prisma.examScore.deleteMany({
      where: {
        examId: examId,
      },
    });

    return true;
  }

  async deleteExamScoreRule(data: DeleteExamScoreRuleInput) {
    await this.prisma.examScoreRule.delete({
      where: {
        examId_problemNumber_subProblemNumber: {
          examId: data.examId,
          problemNumber: data.problemNumber,
          subProblemNumber: data.subProblemNumber,
        },
      },
    });

    return true;
  }

  async deleteExamScoreRuleByExamId(examId: number) {
    await this.prisma.examScoreRule.deleteMany({
      where: {
        examId: examId,
      },
    });

    return true;
  }

  async getScoreDatas(commonRound: number) {
    const examList = await this.findAllByCommonRound(commonRound);
    const sortedExamList = this.sortExamList(examList);

    //TODO: 여기 fp로 바꾸기
    this.addExtractRanking(sortedExamList);
    this.addDistribution(sortedExamList);

    const scoreDatas = this.changeToScoreDatas(sortedExamList);

    return scoreDatas;
  }

  addExtractRanking(examStudentScoreList: ExamStudentScoreDto[]) {
    let sameCount = 0;
    let lastScore = -1;

    examStudentScoreList.forEach((examStudentScore, index) => {
      if (examStudentScore.sum === lastScore) {
        sameCount++;
      } else {
        sameCount = 0;
      }

      examStudentScore.ranking = index + 1 - sameCount;

      lastScore = examStudentScore.sum;
    });
  }

  addDistribution(scoreDatas: ExamStudentScoreDto[]) {
    const totalPeople = scoreDatas.length;

    scoreDatas.forEach((scoreData) => {
      const distribution =
        ((totalPeople - scoreData.ranking) / totalPeople) * 100;
      scoreData.distribution = distribution.toFixed(1);
    });
  }

  changeToScoreDatas(examStudentScoreList: ExamStudentScoreDto[]) {
    const scoreDatas = [];

    examStudentScoreList.forEach((scoreSumData) => {
      const scoreData = this.changeToScoreData(scoreSumData);

      scoreDatas.push(scoreData);
    });

    return scoreDatas;
  }

  //엑셀에 한국어를 넣기 위해 속성이름을 변경
  changeToScoreData(scoreSumData: ExamStudentScoreDto) {
    const scoreData = {};

    scoreData['점수'] = scoreSumData.sum;
    scoreData['등수'] = scoreSumData.ranking;
    scoreData['백분위'] = scoreSumData.distribution;

    return scoreData;
  }

  async getRankingDatas(commonRound: number) {
    const examStudentScoreList = await this.findAllByCommonRound(commonRound);
    const sortedExamList = this.sortExamList(examStudentScoreList);

    this.addExtractRanking(sortedExamList);

    // const exportExamDTOs = this.changeToExportExamDTO(examStudentScoreList);
    const rankingDatas = this.changeToRankingDatas(sortedExamList);

    return rankingDatas;
  }

  changeToRankingDatas(examStudentScoreList: ExamStudentScoreDto[]) {
    const rankingDatas = [];

    examStudentScoreList.forEach((examStudentScore, index) => {
      const rankingData = this.changeToRankingData(examStudentScore, index);

      rankingDatas.push(rankingData);
    });

    return rankingDatas;
  }

  changeToRankingData(examStudentScore: ExamStudentScoreDto, index: number) {
    const rankingData = {};

    rankingData['번호'] = index + 1;
    rankingData['분반'] = examStudentScore.course.name;
    rankingData['이름'] = examStudentScore.student.name;
    rankingData['전화번호'] = examStudentScore.student.phoneNum;
    rankingData['문제(1)'] = examStudentScore.scoreList[0];
    rankingData['문제(2)'] = examStudentScore.scoreList[1];
    rankingData['문제(3)'] = examStudentScore.scoreList[2];
    rankingData['총합'] = examStudentScore.sum;
    rankingData['등수'] = examStudentScore.ranking;
    rankingData['서울대 지원학과'] = examStudentScore.seoulDept;
    rankingData['연세대 지원학과'] = examStudentScore.yonseiDept;

    return rankingData;
  }
}
