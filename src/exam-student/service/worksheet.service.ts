import ExcelErrorMsg from '@common/exception/ExcelErrorMsg';
import { CreateExamStudentInput } from '@exam-student/dto/create-exam-student.input';
import { ExcelExamScoreDto } from '@exam-student/dto/excel-exam-score.dto';
import { ExcelExamStudentDto } from '@exam-student/dto/excel-exam-student.dto';
import { StudentDeptDto } from '@exam-student/dto/student-dept.dto';
import { ExamStudent } from '@exam-student/model/exam-student.model';
import { ExamService } from '@exam/service/exam.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Exam, Student } from '@prisma/client';
import { StudentService } from '@student/service/student.service';
import ExcelJS from 'exceljs';
import CellService from './cell.service';
import { ExamStudentService } from './exam-student.service';

@Injectable()
export class WorksheetService {
  INDEX_ROW = 2;
  COMMON_ROUND_ROW = 1;

  constructor(
    private cellService: CellService,
    private readonly studentService: StudentService,
    private readonly examStudentService: ExamStudentService,
    private readonly examService: ExamService,
  ) {}

  findWorksheetByName(sheetName: string, excel: ExcelJS.Workbook) {
    let worksheetId = -1;

    excel.eachSheet((worksheet, id) => {
      if (worksheet.name.includes(sheetName)) {
        worksheetId = id;
      }
    });

    if (worksheetId < 0) {
      throw new BadRequestException('성적 worksheet이 존재하지 않습니다.');
    }

    return excel.getWorksheet(worksheetId);
  }

  extractExamStudentScoreList(worksheet: ExcelJS.Worksheet) {
    const excelExamStudentDtoList: ExcelExamStudentDto[] = [];
    const indexRow = worksheet.getRow(this.INDEX_ROW);
    const nameCol = this.getNameCol(indexRow);
    const phoneNumCol = this.getPhoneNumCol(indexRow);
    const studentNumCol = this.getStudentNumCol(indexRow);
    const studentRows = this.getStudentRows(worksheet, nameCol, studentNumCol);

    studentRows.forEach((row) => {
      const name = this.getName(row, nameCol);
      const phoneNum = this.getPhoneNum(row, phoneNumCol);

      const excelExamStudentDto = new ExcelExamStudentDto(
        name.toString(),
        phoneNum,
      );
      excelExamStudentDtoList.push(excelExamStudentDto);
    });

    return excelExamStudentDtoList;
  }

  getNameCol(indexRow: ExcelJS.Row) {
    let nameCol = -1;

    indexRow.eachCell((cell, col) => {
      if (this.cellService.isNameIndexCell(cell)) {
        nameCol = col;
        return;
      }
    });

    if (nameCol === -1) {
      throw SyntaxError(ExcelErrorMsg.NO_STUDENT_NAME_COL);
    }

    return nameCol;
  }

  getPhoneNumCol(indexRow: ExcelJS.Row) {
    let phoneNumCol = -1;

    indexRow.eachCell((cell, col) => {
      if (this.cellService.isPhoneNumIndexCell(cell)) {
        phoneNumCol = col;
        return;
      }
    });

    if (phoneNumCol === -1) {
      throw SyntaxError(ExcelErrorMsg.NO_PHONE_NUM_COL);
    }

    return phoneNumCol;
  }

  getStudentNumCol(indexRow: ExcelJS.Row) {
    let studentNumCol = -1;

    indexRow.eachCell((cell, col) => {
      if (this.cellService.isStudentNumIndexCell(cell)) {
        studentNumCol = col;
        return;
      }
    });

    if (studentNumCol === -1) {
      throw SyntaxError(ExcelErrorMsg.NO_STUDENT_NUM_INDEX);
    }

    return studentNumCol;
  }

  getStudentRows(
    worksheet: ExcelJS.Worksheet,
    nameCol: number,
    studentNumCol: number,
  ) {
    const studentRows: ExcelJS.Row[] = [];

    worksheet.eachRow((row) => {
      const studentNumCell = row.getCell(studentNumCol);
      const studentNameCell = row.getCell(nameCol);

      if (
        this.cellService.isStudentNumCell(studentNumCell) &&
        this.cellService.isStudentNameCell(studentNameCell)
      ) {
        studentRows.push(row);
      }
    });

    return studentRows;
  }

  getName(row: ExcelJS.Row, nameCol: number) {
    const nameCell = row.getCell(nameCol);

    if (nameCell.value) {
      return nameCell.value.toString();
    }

    throw new SyntaxError(ExcelErrorMsg.INCORRECT_STUDENT_NAME_INDEX);
  }

  getPhoneNum(row: ExcelJS.Row, phoneNumCol: number) {
    const cell = row.getCell(phoneNumCol);

    return this.cellService.getPhoneNum(cell);
  }

  //REFACTOR: 함수가 너무 길어서 이해하기 힘듬
  async saveExcelExamScores(worksheet: ExcelJS.Worksheet, courseId: number) {
    const indexRow = worksheet.getRow(this.INDEX_ROW);
    const commonRoundRow = worksheet.getRow(this.COMMON_ROUND_ROW);
    const roundExams = [];
    let curRound = 0;
    let curCommonRound = 0;

    for (let colNum = 1; colNum <= indexRow.cellCount; colNum++) {
      const cell = indexRow.getCell(colNum);
      // const cell = indexRow._cells[colNum];

      if (this.cellService.isRoundIndexCell(cell)) {
        const round = this.cellService.getRound(cell, curRound);
        const commonRound = this.getCommonRound(
          commonRoundRow,
          curCommonRound,
          colNum,
        );
        const excelExamScoreDtoList = await this.getExcelExamScoreDtoList(
          worksheet,
          colNum,
          courseId,
        );

        // const exams = [];

        let exam = await this.examService.findByRoundAndCourseId(
          round,
          courseId,
        );

        if (exam == null) {
          exam = await this.examService.save(round, commonRound, courseId);
        }

        const excelPromises = excelExamScoreDtoList.map((excelExamScoreDto) => {
          const createExamStudentInput = CreateExamStudentInput.of(
            exam.id,
            excelExamScoreDto.student.id,
            excelExamScoreDto.scoreList,
          );
          return this.examStudentService.saveWithScore(createExamStudentInput);
        });

        await Promise.all(excelPromises);

        curRound++;
        if (commonRound > 0) {
          curCommonRound++;
        }
      }
    }

    return roundExams;
  }

  private getCommonRound(
    commonRoundRow: ExcelJS.Row,
    curCommonRound: number,
    colNum: number,
  ) {
    //엑셀 양식에 따라 공통회차를 적는 위치가 달라서 두 개를 다 체크한다.
    const oldCommonRound = this.cellService.getCommonRound(
      commonRoundRow.getCell(colNum + 3),
      curCommonRound,
    );
    const newCommonRound = this.cellService.getCommonRound(
      commonRoundRow.getCell(colNum + 4),
      curCommonRound,
    );

    return Math.max(oldCommonRound, newCommonRound);
  }

  private async getExcelExamScoreDtoList(
    worksheet: ExcelJS.Worksheet,
    col: number,
    courseId: number,
  ) {
    //한 행씩 아래로 내려가면서 이름 있는지 확인하고 -> 하나의 객체 만들어서 저장
    //끝나고 나서 합계 구하기
    const firstScoreCol = worksheet.getColumn(col);
    const examScores: ExcelExamScoreDto[] = [];

    for (let rowNum = 1; rowNum <= firstScoreCol.values.length; rowNum++) {
      const cell = worksheet.getRow(rowNum).getCell(col);
      if (this.cellService.isScore(cell)) {
        const scoreCells = this.getScoreCells(worksheet, rowNum, col);
        const scores = this.cellService.getScores(scoreCells);

        const student = await this.findStudent(worksheet, rowNum, courseId);
        // const studentId = student.id;

        if (student != null) {
          examScores.push(new ExcelExamScoreDto(student, scores));
        }
      }
    }

    return examScores;
  }

  private getScoreCells(
    worksheet: ExcelJS.Worksheet,
    rowNum: number,
    colNum: number,
  ) {
    const firstScoreCell = worksheet.getRow(rowNum).getCell(colNum);
    const secondScoreCell = worksheet.getRow(rowNum).getCell(colNum + 1);
    const thirdScoreCell = worksheet.getRow(rowNum).getCell(colNum + 2);

    return [firstScoreCell, secondScoreCell, thirdScoreCell];
  }

  private async findStudent(
    worksheet: ExcelJS.Worksheet,
    rowNum: number,
    courseId: number,
  ) {
    const indexRow = worksheet.getRow(this.INDEX_ROW);
    const nameCol = this.getNameCol(indexRow);
    const name = this.getName(worksheet.getRow(rowNum), nameCol);

    const phoneNumCol = this.getPhoneNumCol(indexRow);
    const phoneNum = this.getPhoneNum(worksheet.getRow(rowNum), phoneNumCol);
    console.log(name + '' + phoneNum);
    const student = await this.findOneByStudentInfo(name, phoneNum);

    //TODO: 여기 뒤에 2개 안 넣어도 되려나
    return student;
  }

  async findOneByStudentInfo(name: string, phoneNum: string) {
    let student: Student = null;

    if (phoneNum == '') {
      return null;
    }

    student = await this.studentService.findOneByPhoneNum(phoneNum);

    if (student === null) {
      throw new SyntaxError(ExcelErrorMsg.NO_EXISTENT_STUDENT);
    }

    return student;
  }

  async extractRoundDeptDatas(worksheet: ExcelJS.Worksheet, courseId: number) {
    const indexRow = worksheet.getRow(this.INDEX_ROW);
    let curCommonRound = 0;

    for (let colNum = 1; colNum <= indexRow.cellCount; colNum++) {
      const cell = indexRow.getCell(colNum);
      // const cell = indexRow._cells[colNum];

      if (this.cellService.isDeptRoundCell(cell, curCommonRound)) {
        const commonRound = this.cellService.getDeptCommonRound(
          cell,
          curCommonRound,
        );
        const studentDeptDtoList = await this.getStudentDepts(
          worksheet,
          colNum,
          courseId,
          commonRound,
        );

        const studentDeptPromises = studentDeptDtoList.map((studentDeptDto) => {
          return this.examStudentService.updateStudentDept(studentDeptDto);
        });

        Promise.all(studentDeptPromises);

        curCommonRound++;
      }
    }
  }

  async getStudentDepts(
    worksheet: ExcelJS.Worksheet,
    col: number,
    courseId: number,
    commonRound: number,
  ) {
    //한 행씩 아래로 내려가면서 이름 있는지 확인하고 -> 하나의 객체 만들어서 저장
    //끝나고 나서 합계 구하기
    const studentDepts: StudentDeptDto[] = [];

    const seoulDeptCol = worksheet.getColumn(col);

    for (let rowNum = 1; rowNum <= seoulDeptCol.values.length; rowNum++) {
      const seoulDeptCell = worksheet.getRow(rowNum).getCell(col);
      const yonseiDeptCell = worksheet.getRow(rowNum).getCell(col + 1);

      const seoulDept = this.cellService.getStudentDept(seoulDeptCell);
      const yonseiDept = this.cellService.getStudentDept(yonseiDeptCell);

      let student: Student;
      let exam: Exam;
      try {
        exam = await this.examService.findByCommonRoundAndCourseId(
          commonRound,
          courseId,
        );
        student = await this.findStudent(worksheet, rowNum, courseId);
      } catch (error) {
        console.log(error.message);
      }

      if (student) {
        console.log(student.name);
        if (seoulDept || yonseiDept) {
          studentDepts.push(
            new StudentDeptDto(
              student,
              exam,
              seoulDept,
              yonseiDept,
              commonRound,
            ),
          );
        }
      }
    }

    return studentDepts;
  }
}
