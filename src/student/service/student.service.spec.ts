import { AuthService } from '@auth/service/auth.service';
import { PasswordService } from '@auth/service/password-service.service';
import { TokenService } from '@auth/service/token.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@user/service/user.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Student } from '@prisma/client';
import { CreateStudentInput } from '@student/dto/create-student.input';
import { PrismaService } from 'nestjs-prisma';
import { StudentService } from './student.service';

describe('StudentService', () => {
  let studentService: StudentService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],

      providers: [
        StudentService,
        AuthService,
        UserService,
        PasswordService,
        TokenService,
        PrismaService,
        ConfigService,
        JwtService,
      ],
    }).compile();

    studentService = module.get<StudentService>(StudentService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(studentService).toBeDefined();
  });

  describe('save', () => {
    it('should throw Bad Request when duplicated phone number', async () => {
      const student = { name: 'testStudent', phoneNum: '0000' };

      jest
        .spyOn(prismaService.student, 'findUnique')
        .mockResolvedValue(student as Student);

      await expect(
        studentService.save({ name: 'testStudent' } as CreateStudentInput),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOneById', () => {
    it('should throw Bad Request when student is not exist', async () => {
      jest.spyOn(prismaService.student, 'findUnique').mockResolvedValue(null);

      await expect(studentService.findOneById(0)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneByPhoneNum', () => {
    it('should throw Bad Request when student is not exist', async () => {
      jest.spyOn(prismaService.student, 'findUnique').mockResolvedValue(null);

      await expect(
        studentService.findOneByPhoneNum('testPNum'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneByUserId', () => {
    it('should throw Bad Request when student is not exist', async () => {
      jest.spyOn(prismaService.student, 'findUnique').mockResolvedValue(null);

      await expect(studentService.findOneByUserId(0)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
