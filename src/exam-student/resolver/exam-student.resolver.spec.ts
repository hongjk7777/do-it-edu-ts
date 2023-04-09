import { Test, TestingModule } from '@nestjs/testing';
import { ExamStudentResolver } from './exam-student.resolver';

describe('ExamStudentResolver', () => {
  let resolver: ExamStudentResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamStudentResolver],
    }).compile();

    resolver = module.get<ExamStudentResolver>(ExamStudentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
