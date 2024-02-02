import { CourseService } from '@course/service/course.service';
import { ExamService } from '@exam/service/exam.service';
import { Injectable } from '@nestjs/common';
import { StudentService } from '@student/service/student.service';
import XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { ExamStudentService } from './exam-student.service';
import { WorksheetService } from './worksheet.service';
import { PrismaService } from 'nestjs-prisma';
import { Exam, ExamScore, ExamScoreRule } from '@prisma/client';
import { ExamStudentScoreDto } from '@exam/dto/exam-student-score.dto';

@Injectable()
export class ExamExcelService {
  constructor(
    private worksheetService: WorksheetService,
    private examStudentService: ExamStudentService,
    private examService: ExamService,
    private studentService: StudentService,
    private prisma: PrismaService,
  ) {}
  FILE_PATH = '';
  SCORE_UNIT_SIZE = 5;
  SCORE_DATE_UNIT_SIZE = 3;
  DISTRIBUTION_UNIT_SIZE = 2;

  async wholeExcelDataToDB(file: Express.Multer.File, courseId: number) {
    const workbook = new ExcelJS.Workbook();
    const excel = await workbook.xlsx.load(file.buffer);

    const deleteSuccess = await this.deletePrevStudentDatas(courseId);
    // 1.examStudentScore, 2. examStudent, 3.examscorerule, 4.examscore, 5. exam, 6.student

    const personalSheet = this.worksheetService.findWorksheetByName(
      '개인',
      excel,
    );

    const excelExamStudentList =
      this.worksheetService.extractExamStudentScoreList(personalSheet);

    await this.examStudentService.saveExamStudentList(
      excelExamStudentList,
      courseId,
    );

    await this.worksheetService.saveExcelExamScores(personalSheet, courseId);
  }

  async excelDataToDB(
    file: Express.Multer.File,
    courseId: number,
    round: number,
  ) {
    const workbook = new ExcelJS.Workbook();
    const excel = await workbook.xlsx.load(file.buffer);

    // const deleteSuccess = await this.deletePrevDatas(courseId);
    // 1.examStudentScore, 2. examStudent, 3.examscorerule, 4.examscore, 5. exam, 6.student

    const personalSheet = this.worksheetService.findWorksheetByName(
      'Sheet1',
      excel,
    );

    await this.worksheetService.saveExcelRoundExamScores(
      personalSheet,
      courseId,
      round,
    );
  }

  async uploadStudentFile(file: Express.Multer.File, courseId: number) {
    const workbook = new ExcelJS.Workbook();
    const excel = await workbook.xlsx.load(file.buffer);

    const personalSheet = this.worksheetService.findWorksheetByName(
      'Sheet1',
      excel,
    );

    const excelExamStudentList =
      this.worksheetService.extractNewExamStudentScoreList(personalSheet);

    await this.examStudentService.saveExamStudentList(
      excelExamStudentList,
      courseId,
    );
  }

  async deletePrevDatas(courseId: number) {
    const examDtoList = await this.examService.findAllInfoByCourseId(courseId);

    for (const examDto of examDtoList) {
      const examStudentList = await this.examStudentService.findAllByExamId(
        examDto.exam.id,
      );

      for (const examStudent of examStudentList) {
        await this.examStudentService.deleteAllExamStudentScoreByExamStudentId(
          examStudent.id,
        );
      }

      await this.examStudentService.deleteAllByExamId(examDto.exam.id);
      await this.examService.deleteExamScoreRuleByExamId(examDto.exam.id);
      await this.examService.deleteExamScoreByExamId(examDto.exam.id);
    }

    await this.examService.deleteAllByCourseId(courseId);
    await this.studentService.deleteAllByCourseId(courseId);
  }

  async deletePrevStudentDatas(courseId: number) {
    const examDtoList = await this.examService.findAllInfoByCourseId(courseId);

    for (const examDto of examDtoList) {
      const examStudentList = await this.examStudentService.findAllByExamId(
        examDto.exam.id,
      );

      for (const examStudent of examStudentList) {
        await this.examStudentService.deleteAllExamStudentScoreByExamStudentId(
          examStudent.id,
        );
      }

      await this.examStudentService.deleteAllByExamId(examDto.exam.id);
    }

    await this.studentService.deleteAllByCourseId(courseId);
  }

  async deleteByStudentId(studentId: number) {
    const examStudentList = await this.examStudentService.findAllByStudentId(
      studentId,
    );

    for (const examStudent of examStudentList) {
      await this.examStudentService.deleteAllExamStudentScoreByExamStudentId(
        examStudent.id,
      );
    }

    await this.examStudentService.deleteAllByStudentId(studentId);

    await this.studentService.deleteOneById(studentId);
  }

  async putDeptDatasToDB(file: Express.Multer.File, courseId: number) {
    const workbook = new ExcelJS.Workbook();
    const excel = await workbook.xlsx.load(file.buffer);

    const worksheet = excel.worksheets[0];

    const roundDeptDatas = await this.worksheetService.extractRoundDeptDatas(
      worksheet,
      courseId,
    );
  }

  async putDeptDataToDB(
    file: Express.Multer.File,
    courseId: number,
    commonRound: number,
  ) {
    const workbook = new ExcelJS.Workbook();
    const excel = await workbook.xlsx.load(file.buffer);

    const worksheet = excel.worksheets[0];

    const roundDeptDatas = await this.worksheetService.extractRoundDeptData(
      worksheet,
      courseId,
      commonRound,
    );
  }

  async createCommonScoreFile(commonRound: number) {
    const workbook = XLSX.utils.book_new();

    await this.createScoreDataSheet(workbook, commonRound);
    await this.createCommonScoreCriteriaSheet(workbook, commonRound);
    await this.createRankingDataSheet(workbook, commonRound);

    const fileName = `공통 ${commonRound}회차 시험.xlsx`;

    await XLSX.writeFile(workbook, this.FILE_PATH + fileName);
    await XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

    return this.FILE_PATH + fileName;
    // await xlsx.writeFile(workbook, FILE_PATH + FILE_NAME);

    //아래는 컨트롤러에 넣기
  }

  private async createScoreDataSheet(
    workbook: XLSX.WorkBook,
    commonRound: number,
  ) {
    const scoreDatas = await this.examService.getScoreDatas(commonRound);
    const scoreDistSheet = XLSX.utils.json_to_sheet(scoreDatas);
    XLSX.utils.book_append_sheet(workbook, scoreDistSheet, '성적분포');
  }

  private async createCommonScoreCriteriaSheet(
    workbook: XLSX.WorkBook,
    commonRound: number,
  ) {
    const excelAoa = [];
    excelAoa.push([`공통 ${commonRound}회차 시험 채점기준`]);
    excelAoa.push([]);

    const exam = await this.examService.findFirstByCommonRound(commonRound);

    if (exam == null) {
      return;
    }

    exam.scoreRule.forEach((scoreRule, index) => {
      let str = `${scoreRule.problemNumber}-(${scoreRule.subProblemNumber})`;

      if (exam.examScore[index]) {
        str += `${exam.examScore[index].title}`;
      }

      excelAoa.push([str]);
      excelAoa.push([scoreRule.scoreRule]);
      excelAoa.push([]);
    });

    const originalSheet = XLSX.utils.aoa_to_sheet(excelAoa);

    XLSX.utils.book_append_sheet(workbook, originalSheet, `채점기준`);
  }

  private async createRankingDataSheet(
    workbook: XLSX.WorkBook,
    commonRound: number,
  ) {
    const rankingDatas = await this.examService.getRankingDatasByCommonRound(
      commonRound,
    );
    const originalSheet = XLSX.utils.json_to_sheet(rankingDatas);
    XLSX.utils.book_append_sheet(workbook, originalSheet, '원본');
  }

  async createScoreExcelFile(courseId: number) {
    const workbook = XLSX.utils.book_new();

    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    await this.createPersonalGradeSheet(workbook, courseId, course.name);
    await this.createScoreDistributionSheet(workbook, courseId, course.name);
    await this.createScoreCriteriaSheets(workbook, courseId);

    const fileName = `test.xlsx`;

    await XLSX.writeFile(workbook, this.FILE_PATH + fileName);
    await XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

    return this.FILE_PATH + fileName;
  }

  private async createPersonalGradeSheet(
    workbook: XLSX.WorkBook,
    courseId: number,
    courseName: string,
  ) {
    const studentList = await this.studentService.findAllByCourseId(courseId);
    const examList = await this.examService.findAllByCourseId(courseId);
    const averageList = ['평균', ''];
    const stdDevList = ['표준편차', ''];
    const studentAmountList = ['인원수', ''];

    const excelAoa = [];
    excelAoa.push([courseName]);

    const excelIndexArray = this.createExcelIndexArray(examList.length);
    excelAoa.push(excelIndexArray);

    const studentMap = this.addExcelIndex(studentList, excelAoa);

    let curIndex = 2; // 이름과 번호
    // console.log(excelAoa);
    // console.log(studentMap);
    // console.log(studentMap.get(1));

    for (const exam of examList) {
      const rankingDatas = await this.examService.getRankingDatasByExamId(
        exam.id,
      );
      curIndex += this.SCORE_UNIT_SIZE;

      rankingDatas.forEach((studentData) => {
        const index = studentMap.get(studentData.student.id);
        // console.log(index);

        studentData.scoreList.forEach((score) => {
          excelAoa[index].push(score);
        });
        excelAoa[index].push(studentData.sum);
        excelAoa[index].push(studentData.ranking);
      });

      excelAoa.forEach((array, index) => {
        if (index == 0) return;

        if (array.length < curIndex) {
          for (let index = 0; index < this.SCORE_UNIT_SIZE; index++) {
            array.push('');
          }
        }
      });

      for (let index = 0; index < this.SCORE_UNIT_SIZE - 1; index++) {
        averageList.push('');
        stdDevList.push('');
        studentAmountList.push('');
      }

      const average = this.calcAverage(rankingDatas);
      averageList.push(average.toFixed(2));
      stdDevList.push(this.calcStdDev(rankingDatas, average).toFixed(2));
      studentAmountList.push(rankingDatas.length.toString());
    }

    excelAoa.push([]);
    excelAoa.push(averageList);
    excelAoa.push(stdDevList);
    excelAoa.push(studentAmountList);

    const originalSheet = XLSX.utils.aoa_to_sheet(excelAoa);
    XLSX.utils.book_append_sheet(workbook, originalSheet, '개인별성적');
  }

  private calcAverage(rankingDatas: ExamStudentScoreDto[]) {
    const totalSum = rankingDatas.reduce((sum, cur) => sum + cur.sum, 0);

    return totalSum / rankingDatas.length;
  }

  private calcStdDev(examStudentList: ExamStudentScoreDto[], average: number) {
    const totalSum = examStudentList.reduce(
      (sum, cur) => sum + (cur.sum - average) ** 2,
      0,
    );

    const variance = totalSum / examStudentList.length;

    return Math.sqrt(variance);
  }

  private addExcelIndex(studentList, excelAoa: any[]) {
    const studentMap = new Map();
    studentList.forEach((student, index) => {
      studentMap.set(student.id, index + 2);
      excelAoa.push([index + 1, student.name, student.phoneNum]);
    });
    return studentMap;
  }

  createExcelIndexArray(length: number) {
    const excelIndexArray = [];

    excelIndexArray.push('순번');
    excelIndexArray.push('이름');
    excelIndexArray.push('학부모전번');

    for (let index = 0; index < length; index++) {
      const round = index + 1;
      excelIndexArray.push(`${round}회(1)`);
      excelIndexArray.push(`${round}회(2)`);
      excelIndexArray.push(`${round}회(3)`);
      excelIndexArray.push(`#${round}`);
      excelIndexArray.push(`순위`);
    }

    return excelIndexArray;
  }

  private async createScoreDistributionSheet(
    workbook: XLSX.WorkBook,
    courseId: number,
    courseName: string,
  ) {
    const studentList = await this.studentService.findAllByCourseId(courseId);
    const examList = await this.examService.findAllByCourseId(courseId);
    const averageList = ['평균'];
    const stdDevList = ['표준편차'];
    const studentAmountList = ['인원수'];

    const excelAoa = [];
    excelAoa.push([`${courseName} 심층성적분포`]);

    const excelIndexArray = this.createDistIndexArray(examList.length);
    excelAoa.push(excelIndexArray);

    studentList.forEach((_, index) => {
      const rank = index + 1;
      excelAoa.push([rank]);
    });

    let curIndex = 0; // 이름과 번호
    // console.log(excelAoa);
    // console.log(studentMap);
    // console.log(studentMap.get(1));

    for (const exam of examList) {
      const scoreDatas = await this.examService.getScoreDatasByExamId(exam.id);
      curIndex += this.DISTRIBUTION_UNIT_SIZE;

      scoreDatas.forEach((scoreData, index) => {
        excelAoa[index + 2].push(scoreData.sum);
        excelAoa[index + 2].push(`${scoreData.distribution}%`);
      });

      excelAoa.forEach((array, index) => {
        if (index == 0) return;

        if (array.length < curIndex) {
          for (let index = 0; index < this.DISTRIBUTION_UNIT_SIZE; index++) {
            array.push('');
          }
        }
      });

      const average = this.calcAverage(scoreDatas);
      averageList.push(average.toFixed(2));
      stdDevList.push(this.calcStdDev(scoreDatas, average).toFixed(2));
      studentAmountList.push(scoreDatas.length.toString());

      averageList.push('');
      stdDevList.push('');
      studentAmountList.push('');
    }

    excelAoa.push([]);
    excelAoa.push(averageList);
    excelAoa.push(stdDevList);
    excelAoa.push(studentAmountList);

    const originalSheet = XLSX.utils.aoa_to_sheet(excelAoa);
    XLSX.utils.book_append_sheet(workbook, originalSheet, '성적분포');
  }

  createDistIndexArray(length: number) {
    const excelIndexArray = [];

    excelIndexArray.push('순위');

    for (let index = 0; index < length; index++) {
      const round = index + 1;
      excelIndexArray.push(`#${round}`);
      excelIndexArray.push(`분포`);
    }

    return excelIndexArray;
  }

  private async createScoreCriteriaSheets(
    workbook: XLSX.WorkBook,
    courseId: number,
  ) {
    const examList = await this.examService.findAllByCourseId(courseId);

    for (let index = 0; index < examList.length; index++) {
      await this.createScoreCriteriaSheet(workbook, examList[index], index + 1);
    }
  }

  private async createScoreCriteriaSheet(
    workbook: XLSX.WorkBook,
    exam: Exam & {
      examScore: ExamScore[];
      scoreRule: ExamScoreRule[];
    },
    examRound: number,
  ) {
    const excelAoa = [];
    excelAoa.push([`${examRound}회차 시험 채점기준`]);
    excelAoa.push([]);

    exam.scoreRule.forEach((scoreRule, index) => {
      excelAoa.push([
        `${exam.examScore[index].problemNumber}. ${exam.examScore[index].title} (${exam.examScore[index].maxScore})`,
      ]);
      excelAoa.push([
        `${scoreRule.problemNumber}-(${scoreRule.subProblemNumber})`,
      ]);
      excelAoa.push([scoreRule.scoreRule]);
      excelAoa.push([]);
    });

    const originalSheet = XLSX.utils.aoa_to_sheet(excelAoa);

    XLSX.utils.book_append_sheet(
      workbook,
      originalSheet,
      `테스트(${examRound}) 채점기준`,
    );
  }

  async createScoreDateFile(courseId: number) {
    const workbook = XLSX.utils.book_new();

    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    await this.createScoreDateSheet(workbook, courseId, course.name);

    const fileName = `test.xlsx`;

    await XLSX.writeFile(workbook, this.FILE_PATH + fileName);
    await XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

    return this.FILE_PATH + fileName;
  }

  private async createScoreDateSheet(
    workbook: XLSX.WorkBook,
    courseId: number,
    courseName: string,
  ) {
    const studentList = await this.studentService.findAllByCourseId(courseId);
    const examList = await this.examService.findAllByCourseId(courseId);

    const excelAoa = [];
    excelAoa.push([courseName + '성적 입력 날짜']);

    const excelIndexArray = this.createScoreDateIndexArray(examList.length);
    excelAoa.push(excelIndexArray);

    const studentMap = this.addExcelIndex(studentList, excelAoa);

    let curIndex = 3; // 이름과 번호

    for (const exam of examList) {
      const rankingDatas = await this.examService.getScoreDatesByExamId(
        exam.id,
      );
      curIndex += this.SCORE_DATE_UNIT_SIZE;

      rankingDatas.forEach((studentData) => {
        const index = studentMap.get(studentData.student.id);

        excelAoa[index].push(studentData.sum);
        excelAoa[index].push(studentData.ranking);
        excelAoa[index].push(studentData.updatedAt);
      });

      excelAoa.forEach((array, index) => {
        if (index == 0) return;

        if (array.length < curIndex) {
          for (let index = 0; index < this.SCORE_DATE_UNIT_SIZE; index++) {
            array.push('');
          }
        }
      });
    }

    const originalSheet = XLSX.utils.aoa_to_sheet(excelAoa);
    XLSX.utils.book_append_sheet(workbook, originalSheet, '성적입력날짜');
  }

  createScoreDateIndexArray(length: number) {
    const excelIndexArray = [];

    excelIndexArray.push('순번');
    excelIndexArray.push('이름');
    excelIndexArray.push('학부모전번');

    for (let index = 0; index < length; index++) {
      const round = index + 1;
      excelIndexArray.push(`#${round}`);
      excelIndexArray.push(`순위`);
      excelIndexArray.push(`입력날짜`);
    }

    return excelIndexArray;
  }
}
