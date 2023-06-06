import { AuthService } from '@auth/service/auth.service';
import { PasswordService } from '@auth/service/password-service.service';
import { TokenService } from '@auth/service/token.service';
import { ExamStudentService } from '@exam-student/service/exam-student.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from '@student/service/student.service';
import { UserService } from '@user/service/user.service';
import { PrismaService } from 'nestjs-prisma';
import { ExamStudentResolver } from './exam-student.resolver';

describe('ExamStudentResolver', () => {
  let resolver: ExamStudentResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        ExamStudentResolver,
        ExamStudentService,
        PrismaService,
        AuthService,
        StudentService,
        UserService,
        PasswordService,
        TokenService,
        ConfigService,
        JwtService,
      ],
    }).compile();

    resolver = module.get<ExamStudentResolver>(ExamStudentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
