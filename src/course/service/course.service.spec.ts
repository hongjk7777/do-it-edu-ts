import { AuthService } from '@auth/service/auth.service';
import { PasswordService } from '@auth/service/password-service.service';
import { TokenService } from '@auth/service/token.service';
import { CourseModule } from '@course/course.module';
import { CreateCourseInput } from '@course/dto/create-course.input';
import { ExamStudentModule } from '@exam-student/exam-student.module';
import CellService from '@exam-student/service/cell.service';
import { ExamExcelService } from '@exam-student/service/exam-excel.service';
import { ExamStudentService } from '@exam-student/service/exam-student.service';
import { WorksheetService } from '@exam-student/service/worksheet.service';
import { ExamService } from '@exam/service/exam.service';
import { CacheModule, CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Course } from '@prisma/client';
import { StudentService } from '@student/service/student.service';
import { UserService } from '@user/service/user.service';
import { PrismaService } from 'nestjs-prisma';
import { CourseService } from './course.service';

describe('CourseService', () => {
  let courseService: CourseService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CourseService,
        PrismaService,
        WorksheetService,
        ExamExcelService,
        CellService,
        StudentService,
        ExamStudentService,
        ExamService,
        AuthService,
        UserService,
        PasswordService,
        TokenService,
        ConfigService,
        JwtService,
      ],
    }).compile();

    courseService = module.get<CourseService>(CourseService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(courseService).toBeDefined();
  });

  // describe('save', () => {
  //   it('should throw bad request error when duplicated name', async () => {
  //     jest
  //       .spyOn(prismaService.course, 'findUnique')
  //       .mockResolvedValue({ id: 1, name: 'test' } as Course);

  //     await expect(courseService.save({} as CreateCourseInput)).rejects.toThrow(
  //       BadRequestException,
  //     );
  //   });
  // });

  describe('findOneByCourseId', () => {
    it('should throw bad request error when course is not exist', async () => {
      jest.spyOn(prismaService.course, 'findUnique').mockResolvedValue(null);

      await expect(courseService.findOneById(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
