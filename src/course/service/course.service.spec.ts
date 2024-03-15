import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { PrismaService } from 'nestjs-prisma';
import { ExamExcelService } from '@exam-student/service/exam-excel.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCourseInput } from '../dto/create-course.input';
import { Course, CourseConfig } from '@prisma/client';
import { Course as CourseModel } from '../model/course.model';

// Mock data
const mockCourse: Course = {
  id: 1,
  name: 'Test Course',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

describe('CourseService', () => {
  let courseService: CourseService;
  let prismaService: DeepMocked<PrismaService>;
  let examExcelService: DeepMocked<ExamExcelService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: PrismaService,
          useValue: {
            course: {
              findMany: jest.fn(),
              count: jest.fn(),
              updateMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
            student: {
              count: jest.fn(),
            },
            exam: {
              count: jest.fn(),
            },
            courseConfig: {
              updateMany: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: ExamExcelService,
          useValue: {
            deletePrevDatas: jest.fn(),
          },
        },
      ],
    }).compile();

    courseService = module.get<CourseService>(CourseService);
    prismaService = module.get(PrismaService);
    examExcelService = module.get(ExamExcelService);
  });

  it('should be defined', () => {
    expect(courseService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of active courses with student and exam counts', async () => {
      const courses = [mockCourse];
      prismaService.course.findMany.mockResolvedValue(courses);
      prismaService.student.count.mockResolvedValue(10);
      prismaService.exam.count.mockResolvedValue(5);

      const result = await courseService.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(CourseModel);
      expect(result[0].studentCount).toBe(10);
      expect(result[0].examCount).toBe(5);
      expect(prismaService.course.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });

    it('should return an empty list if no active courses are found', async () => {
      prismaService.course.findMany.mockResolvedValue([]);
      const result = await courseService.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    const updateCourseInput: CreateCourseInput = {
      id: 1,
      name: 'Updated Course',
    };

    it('should update and return the course', async () => {
      const updatedCourse = { ...mockCourse, name: 'Updated Course' };
      prismaService.course.update.mockResolvedValue(updatedCourse);

      const result = await courseService.update(updateCourseInput);

      expect(result).toEqual(updatedCourse);
      expect(prismaService.course.update).toHaveBeenCalledWith({
        where: { id: updateCourseInput.id },
        data: { name: updateCourseInput.name },
      });
    });

    it('should throw NotFoundException if the course to update does not exist', async () => {
      prismaService.course.update.mockRejectedValue(
        new Error('Record to update not found.'),
      );

      await expect(courseService.update(updateCourseInput)).rejects.toThrow();
    });
  });

  describe('findOneById', () => {
    it('should return a course when a valid id is provided', async () => {
      prismaService.course.findUnique.mockResolvedValue(mockCourse);
      const result = await courseService.findOneById(1);
      expect(result).toEqual(mockCourse);
    });

    it('should throw NotFoundException if course is not found', async () => {
      prismaService.course.findUnique.mockResolvedValue(null);
      await expect(courseService.findOneById(999)).rejects.toThrow(
        new NotFoundException('분반 조회 중 오류가 발생했습니다.'),
      );
    });
  });

  describe('deleteById', () => {
    it('should call dependencies to delete data and the course itself', async () => {
      examExcelService.deletePrevDatas.mockResolvedValue(undefined);
      prismaService.course.delete.mockResolvedValue(mockCourse);

      await courseService.deleteById(1);

      expect(examExcelService.deletePrevDatas).toHaveBeenCalledWith(1);
      expect(prismaService.course.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('setActiveCourse', () => {
    it('should update course active status and course config', async () => {
      const date = '2023-01-01';
      const availableDate = new Date(date);

      await courseService.setActiveCourse(date);

      expect(prismaService.course.updateMany).toHaveBeenCalledWith({
        where: { createdAt: { lt: availableDate } },
        data: { isActive: false },
      });
      expect(prismaService.course.updateMany).toHaveBeenCalledWith({
        where: { createdAt: { gte: availableDate } },
        data: { isActive: true },
      });
      expect(prismaService.courseConfig.updateMany).toHaveBeenCalledWith({
        where: {},
        data: { availableDate: availableDate },
      });
    });
  });

  describe('getAvailableDate', () => {
    it('should return the available date from course config', async () => {
      const mockConfig: CourseConfig = {
        id: 1,
        availableDate: new Date('2023-01-01'),
      };
      prismaService.courseConfig.findFirst.mockResolvedValue(mockConfig);

      const result = await courseService.getAvailableDate();

      expect(result).toEqual(mockConfig.availableDate);
    });
  });
});

// Helper type for deep mocking
type DeepMocked<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? jest.Mock<ReturnType<T[K]>, Parameters<T[K]>>
    : DeepMocked<T[K]>;
};
