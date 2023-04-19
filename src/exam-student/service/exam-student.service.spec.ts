import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { ExamStudentService } from './exam-student.service';

describe('ExamStudentService', () => {
  let service: ExamStudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamStudentService, PrismaService],
    }).compile();

    service = module.get<ExamStudentService>(ExamStudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
