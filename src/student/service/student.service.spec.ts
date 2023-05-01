import { BadRequestException } from '@nestjs/common';
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
      providers: [StudentService, PrismaService],
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
        studentService.save({ name: 'testStudent' } as CreateStudentInput, 1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOneById', () => {
    it('should throw Bad Request when student is not exist', async () => {
      jest.spyOn(prismaService.student, 'findUnique').mockResolvedValue(null);

      await expect(studentService.findOneById(0)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOneByPhoneNum', () => {
    it('should throw Bad Request when student is not exist', async () => {
      jest.spyOn(prismaService.student, 'findUnique').mockResolvedValue(null);

      await expect(
        studentService.findOneByPhoneNum('testPNum'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOneByUserId', () => {
    it('should throw Bad Request when student is not exist', async () => {
      jest.spyOn(prismaService.student, 'findUnique').mockResolvedValue(null);

      await expect(studentService.findOneByUserId(0)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
