import { Module } from '@nestjs/common';
import { ExamStudentResolver } from './resolver/exam-student.resolver';
import { ExamStudentService } from './service/exam-student.service';
import { ExamExcelService } from './service/exam-excel.service';
import { ExamExcelResolver } from './resolver/exam-excel.resolver';
import { ExamExcelController } from './controller/exam-excel.controller';
import { UserService } from '@user/service/user.service';
import { StudentService } from '@student/service/student.service';
import { ExamService } from '@exam/service/exam.service';
import { CourseService } from '@course/service/course.service';
import { AuthService } from '@auth/service/auth.service';
import { WorksheetService } from './service/worksheet.service';
import { PasswordService } from '@auth/service/password-service.service';
import { TokenService } from '@auth/service/token.service';
import CellService from './service/cell.service';
import { AuthModule } from '@auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ExamModule } from '@exam/exam.module';
import { StudentModule } from '@student/student.module';

@Module({
  imports: [
    AuthModule,
    PassportModule,
    JwtModule.register({}),
    ExamModule,
    StudentModule,
  ],
  providers: [
    ExamStudentResolver,
    ExamExcelResolver,
    ExamStudentService,
    ExamExcelService,
    UserService,
    WorksheetService,
    CellService,
  ],
  controllers: [ExamExcelController],
})
export class ExamStudentModule {}
