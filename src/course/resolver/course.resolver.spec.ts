import { AuthModule } from '@auth/auth.module';
import { AuthService } from '@auth/service/auth.service';
import { PasswordService } from '@auth/service/password-service.service';
import { TokenService } from '@auth/service/token.service';
import { CourseService } from '@course/service/course.service';
import { ExamStudentModule } from '@exam-student/exam-student.module';
import CellService from '@exam-student/service/cell.service';
import { ExamExcelService } from '@exam-student/service/exam-excel.service';
import { ExamStudentService } from '@exam-student/service/exam-student.service';
import { WorksheetService } from '@exam-student/service/worksheet.service';
import { ExamService } from '@exam/service/exam.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from '@student/service/student.service';
import { UserService } from '@user/service/user.service';
import { PrismaService } from 'nestjs-prisma';
import { CourseResolver } from './course.resolver';

describe('CourseResolver', () => {
  let resolver: CourseResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CourseResolver,
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

    resolver = module.get<CourseResolver>(CourseResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
