import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { ExamService } from './exam.service';

describe('ExamService', () => {
  let examService: ExamService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamService, PrismaService],
    }).compile();

    examService = module.get<ExamService>(ExamService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(examService).toBeDefined();
  });

  // describe('findByRoundAndCourseId', () => {
  //   it('should throw bad request error when exam is not exist', async () => {
  //     jest.spyOn(prismaService.exam, 'findFirst').mockResolvedValue(null);

  //     await expect(examService.findByRoundAndCourseId(0, 0)).rejects.toThrow(
  //       NotFoundException,
  //     );
  //   });
  // });
});
