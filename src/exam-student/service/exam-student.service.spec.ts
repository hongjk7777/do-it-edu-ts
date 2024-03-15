import { Test, TestingModule } from '@nestjs/testing';
import { ExamStudentService } from './exam-student.service';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from '@auth/service/auth.service';
import { StudentService } from '@student/service/student.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  ExamStudent,
  ExamStudentScore,
  Exam,
  Student,
  User,
  Course,
  UserRoleEnum,
} from '@prisma/client';
import { CreateExamStudentInput } from '../dto/create-exam-student.input';
import { CreateExamStudentScoreInput } from '../dto/create-exam-student-score.input';
import { ExcelExamStudentDto } from '../dto/excel-exam-student.dto';
import { SignupInput } from '@auth/input/signup.input';
import { CreateStudentInput } from '@student/dto/create-student.input';
import { StudentDeptDto } from '../dto/student-dept.dto';

// Mock data
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

const mockUser: User = {
  id: 1,
  username: '1234567890',
  password: 'hashedpassword',
  role: UserRoleEnum.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

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

const mockExamStudentScore: ExamStudentScore = {
  id: 1,
  examStudentId: 1,
  problemNumber: 1,
  problemScore: 10,
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

describe('ExamStudentService', () => {
  let examStudentService: ExamStudentService;
  let prismaService: DeepMocked<PrismaService>;
  let authService: DeepMocked<AuthService>;
  let studentService: DeepMocked<StudentService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamStudentService,
        {
          provide: PrismaService,
          useValue: {
            examStudent: {
              upsert: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
            examStudentScore: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
              deleteMany: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            student: {
              findUnique: jest.fn(),
            },
            examScoreRule: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: AuthService,
          useValue: {
            signUpStudent: jest.fn(),
          },
        },
        {
          provide: StudentService,
          useValue: {
            saveStudent: jest.fn(),
          },
        },
      ],
    }).compile();

    examStudentService = module.get<ExamStudentService>(ExamStudentService);
    prismaService = module.get(PrismaService);
    authService = module.get(AuthService);
    studentService = module.get(StudentService);
  });

  it('should be defined', () => {
    expect(examStudentService).toBeDefined();
  });

  describe('saveWithScore', () => {
    const createExamStudentInput: CreateExamStudentInput = {
      examId: 1,
      studnetId: 1,
      scores: [10, 20],
      seoulDept: 'CS',
      yonseiDept: 'EE',
    };

    it('should upsert exam student and scores successfully', async () => {
      prismaService.examStudent.upsert.mockResolvedValue(mockExamStudent);
      const createExamStudnetScoreListSpy = jest
        .spyOn(examStudentService as any, 'createExamStudnetScoreList')
        .mockReturnValue([mockExamStudentScore]);
      const upsertExamStudentScoreSpy = jest
        .spyOn(examStudentService as any, 'upsertExamStudentScore')
        .mockResolvedValue(undefined);
      const deleteAllExamStudentScoreByExamStudentIdSpy = jest
        .spyOn(
          examStudentService as any,
          'deleteAllExamStudentScoreByExamStudentId',
        )
        .mockResolvedValue(undefined);
      const deleteSpy = jest
        .spyOn(examStudentService as any, 'delete')
        .mockResolvedValue(undefined);

      const result = await examStudentService.saveWithScore(
        createExamStudentInput,
      );

      expect(result).toEqual(mockExamStudent);
      expect(prismaService.examStudent.upsert).toHaveBeenCalled();
      expect(upsertExamStudentScoreSpy).toHaveBeenCalled();
      expect(
        deleteAllExamStudentScoreByExamStudentIdSpy,
      ).not.toHaveBeenCalled();
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should delete exam student and scores if sum of scores is 0', async () => {
      const inputWithZeroScores = { ...createExamStudentInput, scores: [0, 0] };
      prismaService.examStudent.upsert.mockResolvedValue(mockExamStudent);
      const createExamStudnetScoreListSpy = jest
        .spyOn(examStudentService as any, 'createExamStudnetScoreList')
        .mockReturnValue([{ ...mockExamStudentScore, problemScore: 0 }]);
      const deleteAllExamStudentScoreByExamStudentIdSpy = jest
        .spyOn(
          examStudentService as any,
          'deleteAllExamStudentScoreByExamStudentId',
        )
        .mockResolvedValue(undefined);
      const deleteSpy = jest
        .spyOn(examStudentService as any, 'delete')
        .mockResolvedValue(undefined);
      const upsertExamStudentScoreSpy = jest.spyOn(
        examStudentService as any,
        'upsertExamStudentScore',
      ); // Spy without mockResolvedValue

      const result = await examStudentService.saveWithScore(
        inputWithZeroScores,
      );

      expect(result).toEqual(mockExamStudent);
      expect(deleteAllExamStudentScoreByExamStudentIdSpy).toHaveBeenCalledWith(
        mockExamStudent.id,
      );
      expect(deleteSpy).toHaveBeenCalledWith(mockExamStudent.id);
      expect(upsertExamStudentScoreSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateDept', () => {
    const updateExamStudentInput: CreateExamStudentInput = {
      examId: 1,
      studnetId: 1,
      scores: [],
      seoulDept: 'Updated CS',
      yonseiDept: 'Updated EE',
    };

    it('should update department information successfully', async () => {
      prismaService.examStudent.findUnique.mockResolvedValue(mockExamStudent);
      prismaService.examStudent.update.mockResolvedValue({
        ...mockExamStudent,
        seoulDept: 'Updated CS',
        yonseiDept: 'Updated EE',
      });

      const result = await examStudentService.updateDept(
        updateExamStudentInput,
      );

      expect(result.seoulDept).toBe('Updated CS');
      expect(result.yonseiDept).toBe('Updated EE');
      expect(prismaService.examStudent.update).toHaveBeenCalledWith({
        where: { id: mockExamStudent.id },
        data: {
          seoulDept: updateExamStudentInput.seoulDept,
          yonseiDept: updateExamStudentInput.yonseiDept,
        },
      });
    });

    it('should throw NotFoundException if exam student is not found', async () => {
      prismaService.examStudent.findUnique.mockResolvedValue(null);

      await expect(
        examStudentService.updateDept(updateExamStudentInput),
      ).rejects.toThrow(
        new NotFoundException('학생 성적 입력 중 오류가 발생했습니다.'),
      );
    });
  });

  describe('saveExcelExamStudent', () => {
    const excelExamStudentDto: ExcelExamStudentDto = {
      name: 'Excel Student',
      phoneNum: '0000000000',
    };

    it('should save a new student from excel DTO', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      authService.signUpStudent.mockResolvedValue(mockUser);
      prismaService.student.findUnique.mockResolvedValue(null);
      studentService.saveStudent.mockResolvedValue(mockStudent);

      const result = await examStudentService.saveExcelExamStudent(
        excelExamStudentDto,
        1,
      );

      expect(result).toEqual(mockStudent);
      expect(authService.signUpStudent).toHaveBeenCalledWith(
        SignupInput.of(excelExamStudentDto.phoneNum, ''),
      );
      expect(studentService.saveStudent).toHaveBeenCalledWith(
        CreateStudentInput.of(
          excelExamStudentDto.name,
          excelExamStudentDto.phoneNum,
          1,
        ),
        mockUser,
      );
    });

    it('should not save if phone number is empty', async () => {
      const emptyPhoneNumDto = { ...excelExamStudentDto, phoneNum: '' };
      const result = await examStudentService.saveExcelExamStudent(
        emptyPhoneNumDto,
        1,
      );
      expect(result).toBeUndefined();
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return existing student if user and student already exist', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.student.findUnique.mockResolvedValue(mockStudent);

      const result = await examStudentService.saveExcelExamStudent(
        excelExamStudentDto,
        1,
      );

      expect(result).toBeUndefined(); // The service returns undefined if student exists
      expect(authService.signUpStudent).not.toHaveBeenCalled();
      expect(studentService.saveStudent).not.toHaveBeenCalled();
    });
  });

  describe('upsertExamStudent', () => {
    const createExamStudentInput: CreateExamStudentInput = {
      examId: 1,
      studnetId: 1,
      scores: [],
      seoulDept: 'CS',
      yonseiDept: 'EE',
    };

    it('should upsert an exam student successfully', async () => {
      prismaService.examStudent.upsert.mockResolvedValue(mockExamStudent);

      const result = await examStudentService.upsertExamStudent(
        createExamStudentInput,
      );

      expect(result).toEqual(mockExamStudent);
      expect(prismaService.examStudent.upsert).toHaveBeenCalledWith({
        where: {
          examId_studentId: {
            examId: createExamStudentInput.examId,
            studentId: createExamStudentInput.studnetId,
          },
        },
        update: {},
        create: {
          exam: { connect: { id: createExamStudentInput.examId } },
          student: { connect: { id: createExamStudentInput.studnetId } },
          seoulDept: createExamStudentInput.seoulDept,
          yonseiDept: createExamStudentInput.yonseiDept,
        },
      });
    });

    it('should throw NotFoundException if upsert fails', async () => {
      prismaService.examStudent.upsert.mockResolvedValue(null);

      await expect(
        examStudentService.upsertExamStudent(createExamStudentInput),
      ).rejects.toThrow(
        new NotFoundException('학생 성적 입력 중 오류가 발생했습니다.'),
      );
    });
  });

  describe('findOneByExamIdAndStudentId', () => {
    it('should return an exam student when found', async () => {
      prismaService.examStudent.findUnique.mockResolvedValue(mockExamStudent);

      const result = await examStudentService.findOneByExamIdAndStudentId(1, 1);

      expect(result).toEqual(mockExamStudent);
      expect(prismaService.examStudent.findUnique).toHaveBeenCalledWith({
        where: { examId_studentId: { examId: 1, studentId: 1 } },
        include: { examStudentScore: true },
      });
    });

    it('should throw NotFoundException if exam student is not found', async () => {
      prismaService.examStudent.findUnique.mockResolvedValue(null);

      await expect(
        examStudentService.findOneByExamIdAndStudentId(999, 999),
      ).rejects.toThrow(
        new NotFoundException('성적 확인 중 오류가 발생했습니다.'),
      );
    });
  });

  describe('findAllByStudentId', () => {
    it('should return all exam students for a given studentId', async () => {
      const examStudentWithRelations = {
        ...mockExamStudent,
        examStudentScore: [mockExamStudentScore],
        student: mockStudent,
        exam: { ...mockExam, examScore: [] },
      };
      prismaService.examStudent.findMany.mockResolvedValue([
        examStudentWithRelations,
      ]);
      prismaService.examScoreRule.findMany.mockResolvedValue([]);

      const result = await examStudentService.findAllByStudentId(1);

      expect(result).toEqual([examStudentWithRelations]);
      expect(prismaService.examStudent.findMany).toHaveBeenCalledWith({
        where: { studentId: 1 },
        include: {
          examStudentScore: true,
          student: true,
          exam: { include: { examScore: true } },
        },
        orderBy: [{ exam: { round: 'asc' } }],
      });
    });

    it('should return an empty array if no exam students are found', async () => {
      prismaService.examStudent.findMany.mockResolvedValue([]);
      const result = await examStudentService.findAllByStudentId(1);
      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete an exam student by id', async () => {
      prismaService.examStudent.delete.mockResolvedValue(mockExamStudent);

      await examStudentService.delete(1);

      expect(prismaService.examStudent.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('deleteAllByExamId', () => {
    it('should delete all exam students for a given examId', async () => {
      prismaService.examStudent.deleteMany.mockResolvedValue({ count: 2 });

      await examStudentService.deleteAllByExamId(1);

      expect(prismaService.examStudent.deleteMany).toHaveBeenCalledWith({
        where: { examId: 1 },
      });
    });
  });

  describe('deleteAllByStudentId', () => {
    it('should delete all exam students for a given studentId', async () => {
      prismaService.examStudent.deleteMany.mockResolvedValue({ count: 2 });

      await examStudentService.deleteAllByStudentId(1);

      expect(prismaService.examStudent.deleteMany).toHaveBeenCalledWith({
        where: { studentId: 1 },
      });
    });
  });

  describe('deleteAllExamStudentScoreByExamStudentId', () => {
    it('should delete all exam student scores for a given examStudentId', async () => {
      prismaService.examStudentScore.deleteMany.mockResolvedValue({ count: 3 });

      await examStudentService.deleteAllExamStudentScoreByExamStudentId(1);

      expect(prismaService.examStudentScore.deleteMany).toHaveBeenCalledWith({
        where: { examStudentId: 1 },
      });
    });
  });

  describe('updateStudentDept', () => {
    it('should update student department successfully', async () => {
      const studentDeptDto: StudentDeptDto = {
        exam: mockExam,
        student: mockStudent,
        seoulDept: 'New Seoul Dept',
        yonseiDept: 'New Yonsei Dept',
        commonRound: 0, // Added
      };

      prismaService.examStudent.findUnique.mockResolvedValue(mockExamStudent);
      prismaService.examStudent.update.mockResolvedValue({
        ...mockExamStudent,
        seoulDept: 'New Seoul Dept',
        yonseiDept: 'New Yonsei Dept',
      });

      await examStudentService.updateStudentDept(studentDeptDto);

      expect(prismaService.examStudent.findUnique).toHaveBeenCalledWith({
        where: {
          examId_studentId: { examId: mockExam.id, studentId: mockStudent.id },
        },
      });
      expect(prismaService.examStudent.update).toHaveBeenCalledWith({
        where: { id: mockExamStudent.id },
        data: {
          seoulDept: studentDeptDto.seoulDept,
          yonseiDept: studentDeptDto.yonseiDept,
        },
      });
    });

    it('should not update if exam student is not found', async () => {
      const studentDeptDto: StudentDeptDto = {
        exam: mockExam,
        student: mockStudent,
        seoulDept: 'New Seoul Dept',
        yonseiDept: 'New Yonsei Dept',
        commonRound: 0, // Added
      };

      prismaService.examStudent.findUnique.mockResolvedValue(null);

      await examStudentService.updateStudentDept(studentDeptDto);

      expect(prismaService.examStudent.findUnique).toHaveBeenCalled();
      expect(prismaService.examStudent.update).not.toHaveBeenCalled();
    });
  });
});

// Helper type for deep mocking
type DeepMocked<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? jest.Mock<ReturnType<T[K]>, Parameters<T[K]>>
    : DeepMocked<T[K]>;
};
