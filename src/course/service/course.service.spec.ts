import { CreateCourseInput } from '@course/dto/create-course.input';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Course } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { CourseService } from './course.service';

describe('CourseService', () => {
  let courseService: CourseService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseService, PrismaService],
    }).compile();

    courseService = module.get<CourseService>(CourseService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(courseService).toBeDefined();
  });

  describe('save', () => {
    it('should throw bad request error when duplicated name', async () => {
      jest
        .spyOn(prismaService.course, 'findUnique')
        .mockResolvedValue({ id: 1, name: 'test' } as Course);

      await expect(courseService.save({} as CreateCourseInput)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOneByCourseId', () => {
    it('should throw bad request error when course is not exist', async () => {
      jest.spyOn(prismaService.course, 'findUnique').mockResolvedValue(null);

      await expect(courseService.findOneById(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
