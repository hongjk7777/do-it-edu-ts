import { ExamStudentService } from '@exam-student/service/exam-student.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { ExamStudentResolver } from './exam-student.resolver';

describe('ExamStudentResolver', () => {
  let resolver: ExamStudentResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamStudentResolver, ExamStudentService, PrismaService],
    }).compile();

    resolver = module.get<ExamStudentResolver>(ExamStudentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
