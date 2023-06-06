import { CourseService } from '@course/service/course.service';
import { ExamService } from '@exam/service/exam.service';
import { Injectable } from '@nestjs/common';
import { StudentService } from '@student/service/student.service';
import XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { ExamStudentService } from './exam-student.service';
import { WorksheetService } from './worksheet.service';

@Injectable()
export class ExamExcelService {
  constructor(
    private worksheetService: WorksheetService,
    private examStudentService: ExamStudentService,
    private examService: ExamService,
    private studentService: StudentService,
  ) {}
  FILE_PATH = '';

  async putExcelDataToDB(file: Express.Multer.File, courseId: number) {
    const workbook = new ExcelJS.Workbook();
    const excel = await workbook.xlsx.load(file.buffer);

    const deleteSuccess = await this.deletePrevDatas(courseId);
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

  async deletePrevDatas(courseId: number) {
    const examList = await this.examService.findAllByCourseId(courseId);

    for (const exam of examList) {
      const examStudentList = await this.examStudentService.findAllByExamId(
        exam.id,
      );

      for (const examStudent of examStudentList) {
        await this.examStudentService.deleteAllExamStudentScoreByExamStudentId(
          examStudent.id,
        );
      }

      await this.examStudentService.deleteAllByExamId(exam.id);
      await this.examService.deleteExamScoreRuleByExamId(exam.id);
      await this.examService.deleteExamScoreByExamId(exam.id);
    }

    await this.examService.deleteAllByCourseId(courseId);
    await this.studentService.deleteAllByCourseId(courseId);
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

  async createCommonScoreFile(commonRound: number) {
    const workbook = XLSX.utils.book_new();

    await this.createScoreDataSheet(workbook, commonRound);
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

  private async createRankingDataSheet(
    workbook: XLSX.WorkBook,
    commonRound: number,
  ) {
    const rankingDatas = await this.examService.getRankingDatas(commonRound);
    const originalSheet = XLSX.utils.json_to_sheet(rankingDatas);
    XLSX.utils.book_append_sheet(workbook, originalSheet, '원본');
  }
}
