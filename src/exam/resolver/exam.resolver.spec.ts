import { ExamService } from '@exam/service/exam.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { ExamResolver } from './exam.resolver';

describe('ExamResolver', () => {
  let resolver: ExamResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamResolver, ExamService, PrismaService],
    }).compile();

    resolver = module.get<ExamResolver>(ExamResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
