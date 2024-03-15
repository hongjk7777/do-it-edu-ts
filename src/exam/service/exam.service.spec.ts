import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { ExamService } from './exam.service';
import {
  Exam,
  ExamScore,
  ExamScoreRule,
  CommonExamScoreRule,
  ExamStudent,
  ExamStudentScore,
  Student,
  Course,
} from '@prisma/client';
import { CreateExamInput } from '../dto/create-exam.input';
import { CreateExamScoreInput } from '../dto/create-exam-score.input';
import { CreateExamScoreRuleInput } from '../dto/create-exam-score-rule.input';
import { ExamExcelService } from '@exam-student/service/exam-excel.service';
import ExamErrorMsg from '@common/exception/ExamErrorMsg';
import { DeleteExamScoreRuleInput } from '../dto/delete-exam-score-rule.input';
import { ExamStudentScoreDto } from '../dto/exam-student-score.dto';
import { ExamStudentDateDto } from '../dto/exam-student-date.dto';

// Mock data
const mockExam: Exam = {
  id: 1,
  round: 1,
  commonRound: 0,
  courseId: 1,
  average: 0,
  standardDeviation: 0,
  topScore: 0,
  totalTester: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockExamScore: ExamScore = {
  id: 1,
  examId: 1,
  problemNumber: 1,
  maxScore: 10,
  title: 'Problem 1 Title',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockExamScoreRule: ExamScoreRule = {
  id: 1,
  examId: 1,
  problemNumber: 1,
  subProblemNumber: 1,
  scoreRule: 'rule1',
  maxScore: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCommonExamScoreRule: CommonExamScoreRule = {
  id: 1,
  round: 1,
  problemNumber: 1,
  subProblemNumber: 1,
  scoreRule: 'commonRule1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStudent: Student = {
  id: 1,
  name: 'Test Student',
  phoneNum: '1234567890',
  school: 'Test School',
  courseId: 1,
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCourse: Course = {
  id: 1,
  name: 'Test Course',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

const mockExamStudentScore: ExamStudentScore = {
  id: 1,
  examStudentId: 1,
  problemNumber: 1,
  problemScore: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockExamStudent: ExamStudent = {
  id: 1,
  examId: 1,
  studentId: 1,
  ranking: 1,
  seoulDept: 'CS',
  yonseiDept: 'EE',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ExamService', () => {
  let examService: ExamService;
  let prismaService: DeepMocked<PrismaService>;
  let examExcelService: DeepMocked<ExamExcelService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamService,
        {
          provide: PrismaService,
          useValue: {
            exam: {
              create: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(), // Added this line
              groupBy: jest.fn(),
            },
            examScore: {
              upsert: jest.fn(),
              deleteMany: jest.fn(),
            },
            examScoreRule: {
              upsert: jest.fn(),
              deleteMany: jest.fn(),
              delete: jest.fn(),
            },
            commonExamScoreRule: {
              upsert: jest.fn(),
              findMany: jest.fn(),
            },
            examStudent: {
              deleteMany: jest.fn(),
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

    examService = module.get<ExamService>(ExamService);
    prismaService = module.get(PrismaService);
    examExcelService = module.get(ExamExcelService);
  });

  it('should be defined', () => {
    expect(examService).toBeDefined();
  });

  describe('save', () => {
    it('should create a new exam successfully', async () => {
      prismaService.exam.create.mockResolvedValue(mockExam);

      const result = await examService.save(1, 0, 1);

      expect(result).toEqual(mockExam);
      expect(prismaService.exam.create).toHaveBeenCalledWith({
        data: {
          round: 1,
          commonRound: 0,
          course: { connect: { id: 1 } },
        },
      });
    });
  });

  describe('saveExamDatas', () => {
    const createExamInput: CreateExamInput = {
      courseId: 1,
      isCommonRound: false,
      maxScores: [10, 20],
      scoreRule: ['rule1', 'rule2'], // Corrected
    };

    it('should orchestrate saving exam data successfully', async () => {
      jest.spyOn(examService as any, 'getCurRound').mockResolvedValue(0);
      jest.spyOn(examService as any, 'getCurCommonRound').mockResolvedValue(0);
      jest.spyOn(examService as any, 'upsertExam').mockResolvedValue(mockExam);
      jest
        .spyOn(examService as any, 'upsertExamScore')
        .mockResolvedValue(undefined);
      jest
        .spyOn(examService as any, 'upsertExamScoreRuleList')
        .mockResolvedValue(undefined);

      const result = await examService.saveExamDatas(createExamInput);

      expect(result).toEqual(mockExam);
      expect(examService['upsertExam']).toHaveBeenCalled();
      expect(examService['upsertExamScore']).toHaveBeenCalled();
      expect(examService['upsertExamScoreRuleList']).toHaveBeenCalled();
    });
  });

  describe('updateExam', () => {
    it('should update the common round of an exam successfully', async () => {
      const updatedExam = { ...mockExam, commonRound: 1 };
      prismaService.exam.update.mockResolvedValue(updatedExam);

      const result = await examService.updateExam(1, 1);

      expect(result).toEqual(updatedExam);
      expect(prismaService.exam.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { commonRound: 1 },
      });
    });

    it('should throw NotFoundException if exam to update is not found', async () => {
      prismaService.exam.update.mockResolvedValue(null);

      await expect(examService.updateExam(999, 1)).rejects.toThrow(
        new NotFoundException('시험 업데이트 중 오류가 발생했습니다.'),
      );
    });
  });

  describe('findAllByCourseId', () => {
    it('should return all exams for a course', async () => {
      const exams = [{ ...mockExam, examScore: [], scoreRule: [] }];
      prismaService.exam.findMany.mockResolvedValue(exams);

      const result = await examService.findAllByCourseId(1);

      expect(result).toEqual(exams);
      expect(prismaService.exam.findMany).toHaveBeenCalledWith({
        where: { courseId: 1 },
        orderBy: [{ round: 'asc' }],
        include: {
          examScore: { orderBy: [{ problemNumber: 'asc' }] },
          scoreRule: { orderBy: [{ problemNumber: 'asc' }] },
        },
      });
    });

    it('should return an empty array if no exams are found', async () => {
      prismaService.exam.findMany.mockResolvedValue([]);
      const result = await examService.findAllByCourseId(1);
      expect(result).toEqual([]);
    });
  });

  describe('findByRoundAndCourseId', () => {
    it('should return an exam by round and courseId', async () => {
      const examWithDetails = { ...mockExam, examScore: [], scoreRule: [] };
      prismaService.exam.findFirst.mockResolvedValue(examWithDetails);

      const result = await examService.findByRoundAndCourseId(1, 1);

      expect(result).toEqual(examWithDetails);
      expect(prismaService.exam.findFirst).toHaveBeenCalledWith({
        where: { round: 1, courseId: 1 },
        include: {
          examScore: { orderBy: [{ problemNumber: 'asc' }] },
          scoreRule: { orderBy: [{ problemNumber: 'asc' }, { subProblemNumber: 'asc' }] },
        },
      });
    });

    it('should return null if exam is not found', async () => {
      prismaService.exam.findFirst.mockResolvedValue(null);
      const result = await examService.findByRoundAndCourseId(999, 1);
      expect(result).toBeNull();
    });
  });

  describe('deleteLastExamByCourseId', () => {
    it('should delete the last exam and its related data for a course', async () => {
      const maxRoundExam = { ...mockExam, id: 10 };
      prismaService.exam.findFirst.mockResolvedValue(maxRoundExam);
      prismaService.examStudent.deleteMany.mockResolvedValue({ count: 1 });
      jest
        .spyOn(examService as any, 'deleteExamScoreRuleByExamId')
        .mockResolvedValue(true);
      jest
        .spyOn(examService as any, 'deleteExamScoreByExamId')
        .mockResolvedValue(true);
      prismaService.exam.delete.mockResolvedValue(maxRoundExam);

      await examService.deleteLastExamByCourseId(1);

      expect(prismaService.exam.findFirst).toHaveBeenCalledWith({
        where: { courseId: 1 },
        orderBy: { round: 'desc' },
      });
      expect(prismaService.examStudent.deleteMany).toHaveBeenCalledWith({
        where: { examId: maxRoundExam.id },
      });
      expect(examService['deleteExamScoreRuleByExamId']).toHaveBeenCalledWith(
        maxRoundExam.id,
      );
      expect(examService['deleteExamScoreByExamId']).toHaveBeenCalledWith(
        maxRoundExam.id,
      );
      expect(prismaService.exam.delete).toHaveBeenCalledWith({
        where: { id: maxRoundExam.id },
      });
    });

    it('should throw an error if no exam is found to delete', async () => {
      prismaService.exam.findFirst.mockResolvedValue(null);

      await expect(examService.deleteLastExamByCourseId(1)).rejects.toThrow();
    });
  });

  describe('deleteAllByCourseId', () => {
    it('should delete all exams for a given courseId', async () => {
      prismaService.exam.deleteMany.mockResolvedValue({ count: 2 });

      await examService.deleteAllByCourseId(1);

      expect(prismaService.exam.deleteMany).toHaveBeenCalledWith({
        where: { courseId: 1 },
      });
    });
  });

  describe('findAllCommonExamScoreRule', () => {
    it('should return all common exam score rules', async () => {
      const rules = [mockCommonExamScoreRule];
      prismaService.commonExamScoreRule.findMany.mockResolvedValue(rules);

      const result = await examService.findAllCommonExamScoreRule();

      expect(result).toEqual(rules);
      expect(prismaService.commonExamScoreRule.findMany).toHaveBeenCalledWith({
        where: {},
        distinct: ['round'],
        orderBy: { round: 'asc' },
      });
    });

    it('should throw NotFoundException if no common exam score rules are found', async () => {
      prismaService.commonExamScoreRule.findMany.mockResolvedValue(null);

      await expect(examService.findAllCommonExamScoreRule()).rejects.toThrow(
        new NotFoundException(ExamErrorMsg.NO_SCORE_RULE),
      );
    });
  });

  describe('findCommonExamScoreRuleByRound', () => {
    it('should return common exam score rules for a given round', async () => {
      const rules = [mockCommonExamScoreRule];
      prismaService.commonExamScoreRule.findMany.mockResolvedValue(rules);

      const result = await examService.findCommonExamScoreRuleByRound(1);

      expect(result).toEqual(rules);
      expect(prismaService.commonExamScoreRule.findMany).toHaveBeenCalledWith({
        where: { round: 1 },
      });
    });

    it('should throw NotFoundException if no common exam score rules are found for the round', async () => {
      prismaService.commonExamScoreRule.findMany.mockResolvedValue(null);

      await expect(
        examService.findCommonExamScoreRuleByRound(999),
      ).rejects.toThrow(new NotFoundException(ExamErrorMsg.NO_SCORE_RULE));
    });
  });

  describe('getScoreDatas', () => {
    it('should return processed score data for a common round', async () => {
      const mockExamStudentScoreDto: ExamStudentScoreDto = {
        student: mockStudent,
        sum: 100,
        scoreList: [50, 50],
        seoulDept: 'CS',
        yonseiDept: 'EE',
        course: mockCourse,
        ranking: 1,
        distribution: '100.0',
      };

      jest
        .spyOn(examService, 'findAllByCommonRound')
        .mockResolvedValue([mockExamStudentScoreDto]);
      jest
        .spyOn(examService as any, 'sortExamList')
        .mockReturnValue([mockExamStudentScoreDto]);
      jest
        .spyOn(examService as any, 'addExtractRanking')
        .mockImplementation((list) => {
          list[0].ranking = 1;
        });
      jest
        .spyOn(examService as any, 'addDistribution')
        .mockImplementation((list) => {
          list[0].distribution = '100.0';
        });
      jest
        .spyOn(examService as any, 'changeToScoreDatas')
        .mockReturnValue([{
          점수: 100,
          등수: 1,
          백분위: '100.0'
        }]);

      const result = await examService.getScoreDatas(1);

      expect(result).toEqual([{
        점수: 100,
        등수: 1,
        백분위: '100.0'
      }]);
      expect(examService.findAllByCommonRound).toHaveBeenCalledWith(1);
    });
  });

  describe('getScoreDatasByExamId', () => {
    it('should return processed score data for an exam ID', async () => {
      const mockExamStudentScoreDto: ExamStudentScoreDto = {
        student: mockStudent,
        sum: 100,
        scoreList: [50, 50],
        seoulDept: 'CS',
        yonseiDept: 'EE',
        course: mockCourse,
        ranking: 1,
        distribution: '100.0',
      };

      jest
        .spyOn(examService, 'findAllScoreByExamId')
        .mockResolvedValue([mockExamStudentScoreDto]);
      jest
        .spyOn(examService as any, 'sortExamList')
        .mockReturnValue([mockExamStudentScoreDto]);
      jest
        .spyOn(examService as any, 'addExtractRanking')
        .mockImplementation((list) => {
          list[0].ranking = 1;
        });
      jest
        .spyOn(examService as any, 'addDistribution')
        .mockImplementation((list) => {
          list[0].distribution = '100.0';
        });

      const result = await examService.getScoreDatasByExamId(1);

      expect(result).toEqual([mockExamStudentScoreDto]);
      expect(examService.findAllScoreByExamId).toHaveBeenCalledWith(1);
    });
  });

  describe('getScoreDatesByExamId', () => {
    it('should return processed score dates for an exam ID', async () => {
      const mockExamStudentDateDto: ExamStudentDateDto = {
        student: mockStudent,
        sum: 100,
        scoreList: [50, 50],
        seoulDept: 'CS',
        yonseiDept: 'EE',
        course: mockCourse,
        ranking: 1,
        distribution: '100.0',
        updatedAt: new Date().toLocaleDateString(), // Corrected to match the service's output format
      };

      jest
        .spyOn(examService, 'findAllScoreDateByExamId')
        .mockResolvedValue([mockExamStudentDateDto]);
      jest
        .spyOn(examService as any, 'addExtractRanking')
        .mockImplementation((list) => {
          list[0].ranking = 1;
        });

      const result = await examService.getScoreDatesByExamId(1);

      expect(result).toEqual([mockExamStudentDateDto]);
      expect(examService.findAllScoreDateByExamId).toHaveBeenCalledWith(1);
    });
  });

  describe('addExtractRanking', () => {
    it('should correctly add ranking to exam student scores', () => {
      const scores: ExamStudentScoreDto[] = [
        {
          student: mockStudent,
          sum: 100,
          scoreList: [],
          seoulDept: '',
          yonseiDept: '',
          course: mockCourse,
          ranking: 0,
          distribution: '0.0',
        },
        {
          student: mockStudent,
          sum: 90,
          scoreList: [],
          seoulDept: '',
          yonseiDept: '',
          course: mockCourse,
          ranking: 0,
          distribution: '0.0',
        },
        {
          student: mockStudent,
          sum: 90,
          scoreList: [],
          seoulDept: '',
          yonseiDept: '',
          course: mockCourse,
          ranking: 0,
          distribution: '0.0',
        },
        {
          student: mockStudent,
          sum: 80,
          scoreList: [],
          seoulDept: '',
          yonseiDept: '',
          course: mockCourse,
          ranking: 0,
          distribution: '0.0',
        },
      ];

      examService.addExtractRanking(scores);

      expect(scores[0].ranking).toBe(1);
      expect(scores[1].ranking).toBe(2);
      expect(scores[2].ranking).toBe(2);
      expect(scores[3].ranking).toBe(4);
    });
  });

  describe('addDistribution', () => {
    it('should correctly add distribution to exam student scores', () => {
      const scores: ExamStudentScoreDto[] = [
        {
          student: mockStudent,
          sum: 100,
          scoreList: [],
          seoulDept: '',
          yonseiDept: '',
          course: mockCourse,
          ranking: 1,
          distribution: '0.0',
        },
        {
          student: mockStudent,
          sum: 90,
          scoreList: [],
          seoulDept: '',
          yonseiDept: '',
          course: mockCourse,
          ranking: 2,
          distribution: '0.0',
        },
      ];

      examService.addDistribution(scores);

      expect(scores[0].distribution).toBe('50.0'); // (2-1)/2 * 100
      expect(scores[1].distribution).toBe('0.0'); // (2-2)/2 * 100
    });
  });

  describe('changeToScoreDatas', () => {
    it('should transform ExamStudentScoreDto to score data format', () => {
      const mockExamStudentScoreDto: ExamStudentScoreDto = {
        student: mockStudent,
        sum: 100,
        scoreList: [50, 50],
        seoulDept: 'CS',
        yonseiDept: 'EE',
        course: mockCourse,
        ranking: 1,
        distribution: '100.0',
      };

      const result = examService.changeToScoreDatas([mockExamStudentScoreDto]);

      expect(result).toEqual([{
        점수: 100,
        등수: 1,
        백분위: '100.0'
      }]);
    });
  });

  describe('changeToRankingDatas', () => {
    it('should transform ExamStudentScoreDto to ranking data format', () => {
      const mockExamStudentScoreDto: ExamStudentScoreDto = {
        student: mockStudent,
        sum: 100,
        scoreList: [50, 50],
        seoulDept: 'CS',
        yonseiDept: 'EE',
        course: mockCourse,
        ranking: 1,
        distribution: '100.0',
      };

      const result = examService.changeToRankingDatas([mockExamStudentScoreDto]);

      expect(result).toEqual([
        {
          '번호': 1,
          '분반': 'Test Course',
          '이름': 'Test Student',
          '전화번호': '1234567890',
          '문제(1)': 50,
          '문제(2)': 50,
          '문제(3)': undefined,
          '총합': 100,
          '등수': 1,
          '서울대 지원학과': 'CS',
          '연세대 지원학과': 'EE',
        },
      ]);
    });
  });
});

// Helper type for deep mocking
type DeepMocked<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? jest.Mock<ReturnType<T[K]>, Parameters<T[K]>>
    : DeepMocked<T[K]>;
};