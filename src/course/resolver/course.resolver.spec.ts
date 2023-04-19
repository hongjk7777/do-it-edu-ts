import { CourseService } from '@course/service/course.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { CourseResolver } from './course.resolver';

describe('CourseResolver', () => {
  let resolver: CourseResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseResolver, CourseService, PrismaService],
    }).compile();

    resolver = module.get<CourseResolver>(CourseResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});