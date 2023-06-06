import ExcelErrorMsg from '@common/exception/ExcelErrorMsg';
import { Injectable } from '@nestjs/common';

import ExcelJS from 'exceljs';

@Injectable()
export default class CellService {
  isNameIndexCell(cell: ExcelJS.Cell) {
    if (cell.value && typeof cell.value === 'string') {
      return cell.value.includes('이름');
    }

    return false;
  }

  isPhoneNumIndexCell(cell: ExcelJS.Cell) {
    if (cell.value && typeof cell.value === 'string') {
      return (
        !cell.value.includes('학생') &&
        (cell.value.includes('학부모') || cell.value.includes('전번'))
      );
    }

    return false;
  }

  isStudentNumIndexCell(cell: ExcelJS.Cell) {
    if (cell.value && typeof cell.value === 'string') {
      return cell.value.includes('순번');
    }

    return false;
  }

  isStudentNumCell(cell: ExcelJS.Cell) {
    const cancelStudentIndex = '중단';
    if (cell.value) {
      if (typeof cell.value === 'number') {
        return true;
      } else if (typeof cell.value === 'string') {
        const studentNum = cell.value.split(' ').join();
        return !isNaN(Number(studentNum)) || studentNum == cancelStudentIndex;
      }
    }

    return false;
  }

  isStudentNameCell(cell: ExcelJS.Cell) {
    if (cell.value) {
      let name = cell.value;

      if (typeof cell.value === 'string') {
        name = cell.value.split(' ').join();
      }

      if (name == '' || name == '이름') {
        return false;
      }

      return true;
    }

    return false;
  }

  getPhoneNum(cell: ExcelJS.Cell) {
    let value = cell.value;

    if (value) {
      if (typeof value === 'number') {
        value = '0' + value;
      } else if (typeof value === 'string') {
        value = value.split(' ').join();
      }
      return this.parseOnlyNumber(value.toString());
    }

    return '';
  }

  private parseOnlyNumber(str: string) {
    const regex = /[^0-9]/g;
    const result = str.replace(regex, '');

    return result;
  }

  isRoundIndexCell(cell: ExcelJS.Cell) {
    if (cell.value && typeof cell.value === 'string') {
      return cell.value.includes('회') && cell.value.includes('(1)');
    }

    return false;
  }

  getRound(cell: ExcelJS.Cell, curRound: number) {
    if (cell.value) {
      const roundStr = cell.value.toString().split('회', 1)[0];
      const round = parseInt(this.parseOnlyNumber(roundStr));
      if (!isNaN(round) && round == curRound + 1) {
        return round;
      }
    }

    throw new SyntaxError(ExcelErrorMsg.INCORRECT_EXAM_ROUND_INDEX);
  }

  getCommonRound(cell: ExcelJS.Cell, curCommonRound: number) {
    if (cell.value) {
      const commonRound = parseInt(this.parseOnlyNumber(cell.value.toString()));

      if (!isNaN(commonRound)) {
        if (commonRound == curCommonRound + 1) {
          return commonRound;
        }

        throw new SyntaxError(ExcelErrorMsg.INCORRECT_COMMON_ROUND_INDEX);
      }
    }

    return 0;
  }

  isScore(cell: ExcelJS.Cell) {
    if (cell.value && typeof cell.value === 'number') {
      const score = cell.value;
      if (isNaN(score)) {
        throw new SyntaxError(ExcelErrorMsg.INCORRECT_EXAM_SCORE);
      }

      return true;
    }

    if (cell.value === 0) {
      //점수가 0일 경우 false로 취급되어 따로 분리
      return true;
    }

    return false;
  }

  getScores(scoreCells: ExcelJS.Cell[]) {
    const scores: number[] = [];

    scoreCells.forEach((scoreCell) => {
      const score = this.getScore(scoreCell);
      scores.push(score);
    });

    return scores;
  }

  getScore(scoreCell: ExcelJS.Cell) {
    if (scoreCell.value) {
      let score = 0;

      if (typeof scoreCell.value === 'number') {
        score = scoreCell.value;
      } else if (typeof scoreCell.value === 'string') {
        score = parseInt(this.parseOnlyNumber(scoreCell.value.toString()));
      }

      if (isNaN(score)) {
        throw new SyntaxError(ExcelErrorMsg.INCORRECT_EXAM_SCORE);
      }

      return score;
    }

    return 0;
  }

  isDeptRoundCell(cell: ExcelJS.Cell, curCommonRound: number) {
    if (cell.value) {
      let round = 0;
      if (typeof cell.value === 'number') {
        return cell.value === curCommonRound + 1;
      } else if (typeof cell.value === 'string') {
        round = parseInt(this.parseOnlyNumber(cell.value.toString()));

        return !isNaN(round) && round === curCommonRound + 1;
      }
    }

    return false;
  }

  getDeptCommonRound(cell: ExcelJS.Cell, prevCommonRound: number) {
    if (cell.value) {
      let commonRound = 0;

      if (typeof cell.value === 'string') {
        commonRound = parseInt(this.parseOnlyNumber(cell.value.toString()));
      } else if (typeof cell.value === 'number') {
        commonRound = cell.value;
      }

      if (commonRound != prevCommonRound + 1) {
        throw new SyntaxError(ExcelErrorMsg.INCORRECT_DEPT_ROUND);
      }

      return commonRound;
    }

    throw new SyntaxError(ExcelErrorMsg.INCORRECT_DEPT_ROUND);
  }

  getStudentDept(cell: ExcelJS.Cell) {
    const value = cell.value;

    if (value && typeof value === 'string') {
      if (value.includes('과') || value.includes('부')) {
        return value;
      }
    }

    return null;
  }
}
