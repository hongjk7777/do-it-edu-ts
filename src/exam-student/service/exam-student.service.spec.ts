import { AuthModule } from '@auth/auth.module';
import { AuthService } from '@auth/service/auth.service';
import { PasswordService } from '@auth/service/password-service.service';
import { TokenService } from '@auth/service/token.service';
import { CacheModule } from '@nestjs/cache-manager';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from '@student/service/student.service';
import { UserService } from '@user/service/user.service';
import { UserModule } from '@user/user.module';
import { PrismaService } from 'nestjs-prisma';
import { ExamStudentService } from './exam-student.service';

describe('ExamStudentService', () => {
  let examStudentService: ExamStudentService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
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

    examStudentService = module.get<ExamStudentService>(ExamStudentService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(examStudentService).toBeDefined();
  });

  describe('findOneByExamIdAndStudentId', () => {
    it('should throw bad request error when student is not exist', async () => {
      jest
        .spyOn(prismaService.examStudent, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        examStudentService.findOneByExamIdAndStudentId(0, 0),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
