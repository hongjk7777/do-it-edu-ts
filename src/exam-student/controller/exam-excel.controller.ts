import { Public } from '@common/decorator/public.decorator';
import { ExamExcelService } from '@exam-student/service/exam-excel.service';
import {
  Controller,
  Get,
  HttpCode,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { number } from 'joi';
import path, { join } from 'path';

@Controller('exam-excel')
export class ExamExcelController {
  constructor(private examExcelService: ExamExcelService) {}

  @Post('score')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  async uploadScoreFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('courseId') courseId: string,
  ) {
    return await this.examExcelService.wholeExcelDataToDB(
      file,
      parseInt(courseId),
    );
  }

  @Post('score-round')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  async uploadRoundScoreFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('courseId') courseId: string,
    @Query('round') round: string,
  ) {
    return await this.examExcelService.excelDataToDB(
      file,
      parseInt(courseId),
      parseInt(round),
    );
  }

  @Post('student')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  async uploadStudentFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('courseId') courseId: string,
  ) {
    return await this.examExcelService.uploadStudentFile(
      file,
      parseInt(courseId),
    );
  }

  @Post('dept')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDeptFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('courseId') courseId: string,
  ) {
    return await this.examExcelService.putDeptDatasToDB(
      file,
      parseInt(courseId),
    );
  }

  @Post('dept-round')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDeptRoundFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('courseId') courseId: string,
    @Query('round') round: number,
  ) {
    return await this.examExcelService.putDeptDataToDB(
      file,
      parseInt(courseId),
      round,
    );
  }

  @Get()
  @Public()
  @HttpCode(200)
  async downloadCommonScoreFile(
    @Query('commonRound', ParseIntPipe) commonRound: number,
    @Res() res: Response,
  ) {
    const excelPath = await this.examExcelService.createCommonScoreFile(
      commonRound,
    );

    res.sendFile(path.join(process.cwd(), excelPath));
  }

  @Get('score-excel')
  @Public()
  @HttpCode(200)
  async downloadScoreExcelFile(
    @Query('courseId', ParseIntPipe) courseId: number,
    @Res() res: Response,
  ) {
    const excelPath = await this.examExcelService.createScoreExcelFile(
      courseId,
    );

    res.sendFile(path.join(process.cwd(), excelPath));
  }

  @Get('score-date')
  @Public()
  @HttpCode(200)
  async downloadScoreDateFile(
    @Query('courseId', ParseIntPipe) courseId: number,
    @Res() res: Response,
  ) {
    const excelPath = await this.examExcelService.createScoreDateFile(courseId);

    res.sendFile(path.join(process.cwd(), excelPath));
  }
}
