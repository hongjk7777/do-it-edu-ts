import ExcelErrorMsg from '@common/exception/ExcelErrorMsg';
import { Injectable } from '@nestjs/common';

import ExcelJS from 'exceljs';

@Injectable()
export default class CellService {
  isNameIndexCell(cell: ExcelJS.Cell) {
    if (cell.text && typeof cell.text === 'string') {
      return cell.text.includes('이름');
    }

    return false;
  }

  isPhoneNumIndexCell(cell: ExcelJS.Cell) {
    if (cell.text && typeof cell.text === 'string') {
      return (
        !cell.text.includes('학생') &&
        (cell.text.includes('학부모') || cell.text.includes('전번'))
      );
    }

    return false;
  }

  isStudentNumIndexCell(cell: ExcelJS.Cell) {
    if (cell.text && typeof cell.text === 'string') {
      return cell.text.includes('순번');
    }

    return false;
  }

  isStudentNumCell(cell: ExcelJS.Cell) {
    const cancelStudentIndex = '중단';
    if (cell.text) {
      if (typeof cell.text === 'number') {
        return true;
      } else if (typeof cell.text === 'string') {
        const studentNum = cell.text.split(' ').join();
        return !isNaN(Number(studentNum)) || studentNum == cancelStudentIndex;
      }
    }

    return false;
  }

  isStudentNameCell(cell: ExcelJS.Cell) {
    if (cell.text) {
      let name = cell.text;

      if (typeof cell.text === 'string') {
        name = cell.text.split(' ').join();
      }

      if (name == '' || name == '이름') {
        return false;
      }

      return true;
    }

    return false;
  }

  getPhoneNum(cell: ExcelJS.Cell) {
    let value = cell.text;

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
    if (cell.text && typeof cell.text === 'string') {
      return cell.text.includes('회') && cell.text.includes('(1)');
    }

    return false;
  }

  getRound(cell: ExcelJS.Cell, curRound: number) {
    if (cell.text) {
      const roundStr = cell.text.toString().split('회', 1)[0];
      const round = parseInt(this.parseOnlyNumber(roundStr));
      if (!isNaN(round) && round == curRound + 1) {
        return round;
      }
    }

    throw new SyntaxError(ExcelErrorMsg.INCORRECT_EXAM_ROUND_INDEX);
  }

  getCommonRound(cell: ExcelJS.Cell, curCommonRound: number) {
    if (cell.text) {
      const commonRound = parseInt(this.parseOnlyNumber(cell.text.toString()));

      if (!isNaN(commonRound)) {
        console.log('commonRound' + commonRound);

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
    if (scoreCell.text) {
      let score = 0;

      if (typeof scoreCell.text === 'number') {
        score = scoreCell.text;
      } else if (typeof scoreCell.text === 'string') {
        score = parseInt(this.parseOnlyNumber(scoreCell.text.toString()));
      }

      if (isNaN(score)) {
        throw new SyntaxError(ExcelErrorMsg.INCORRECT_EXAM_SCORE);
      }

      return score;
    }

    return 0;
  }

  isDeptRoundCell(cell: ExcelJS.Cell, curCommonRound: number) {
    if (cell.text) {
      let round = 0;
      if (typeof cell.text === 'number') {
        return cell.text === curCommonRound + 1;
      } else if (typeof cell.text === 'string') {
        round = parseInt(this.parseOnlyNumber(cell.text.toString()));

        return !isNaN(round) && round === curCommonRound + 1;
      }
    }

    return false;
  }

  getDeptCommonRound(cell: ExcelJS.Cell, prevCommonRound: number) {
    if (cell.text) {
      let commonRound = 0;

      if (typeof cell.text === 'string') {
        commonRound = parseInt(this.parseOnlyNumber(cell.text.toString()));
      } else if (typeof cell.text === 'number') {
        commonRound = cell.text;
      }

      if (commonRound != prevCommonRound + 1) {
        throw new SyntaxError(ExcelErrorMsg.INCORRECT_DEPT_ROUND);
      }

      return commonRound;
    }

    throw new SyntaxError(ExcelErrorMsg.INCORRECT_DEPT_ROUND);
  }

  getStudentDept(cell: ExcelJS.Cell) {
    const value = cell.text;

    if (value && typeof value === 'string') {
      if (value.includes('과') || value.includes('부')) {
        return value;
      }
    }

    return null;
  }
}
