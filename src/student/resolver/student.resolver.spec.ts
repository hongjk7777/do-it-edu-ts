import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from '@student/service/student.service';
import { PrismaService } from 'nestjs-prisma';
import { StudentResolver } from './student.resolver';

describe('StudentResolver', () => {
  let resolver: StudentResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentResolver, StudentService, PrismaService],
    }).compile();

    resolver = module.get<StudentResolver>(StudentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
