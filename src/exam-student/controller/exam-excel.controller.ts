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
    return await this.examExcelService.putExcelDataToDB(
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
    // const file = createReadStream(join(process.cwd(), path));

    // file.pipe(res);
  }
}
