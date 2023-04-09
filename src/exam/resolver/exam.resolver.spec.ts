import { Test, TestingModule } from '@nestjs/testing';
import { ExamResolver } from './exam.resolver';

describe('ExamResolver', () => {
  let resolver: ExamResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamResolver],
    }).compile();

    resolver = module.get<ExamResolver>(ExamResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
