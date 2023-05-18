import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { ExamStudentService } from './exam-student.service';

describe('ExamStudentService', () => {
  let examStudentService: ExamStudentService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamStudentService, PrismaService],
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
