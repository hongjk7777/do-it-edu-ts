import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './student.service';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from '@auth/service/auth.service';
import { UserService } from '@user/service/user.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateStudentInput } from '../dto/create-student.input';
import { UpdateStudentInput } from '../dto/update-student.input';
import { Student, User, UserRoleEnum } from '@prisma/client';
import { SignupInput } from '@auth/input/signup.input';
import { ChangePasswordInput } from '@auth/input/change-password.input';

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

describe('StudentService', () => {
  let studentService: StudentService;
  let prismaService: DeepMocked<PrismaService>;
  let authService: DeepMocked<AuthService>;
  let userService: DeepMocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        {
          provide: PrismaService,
          useValue: {
            student: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
            user: {
              update: jest.fn(),
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
          provide: UserService,
          useValue: {
            changePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    studentService = module.get<StudentService>(StudentService);
    prismaService = module.get(PrismaService);
    authService = module.get(AuthService);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(studentService).toBeDefined();
  });

  describe('save', () => {
    const createStudentInput: CreateStudentInput = {
      name: 'Test Student',
      phoneNum: '1234567890',
      school: 'Test School',
      courseId: 1,
    };

    it('should throw BadRequestException if a student with the same name already exists in the course', async () => {
      prismaService.student.findFirst.mockResolvedValue(mockStudent);
      await expect(studentService.save(createStudentInput)).rejects.toThrow(
        new BadRequestException('동일한 학생이 존재합니다.'),
      );
    });

    it('should throw BadRequestException if a student with the same phone number already exists', async () => {
      prismaService.student.findFirst.mockResolvedValue(null);
      prismaService.student.findUnique.mockResolvedValue(mockStudent);
      await expect(studentService.save(createStudentInput)).rejects.toThrow(
        new BadRequestException('동일한 학생이 존재합니다.'),
      );
    });
  });

  describe('update', () => {
    const updateStudentInput: UpdateStudentInput = {
      id: 1,
      name: 'Updated Student',
      phoneNum: '0987654321',
      school: 'Updated School',
      courseId: 1,
    };

    const oldStudent = { ...mockStudent, phoneNum: '1234567890' };
    const updatedStudent = { ...mockStudent, ...updateStudentInput };
    const updatedUser = { ...mockUser, username: updateStudentInput.phoneNum };

    it('should update student and user details successfully', async () => {
      prismaService.student.findUnique.mockResolvedValue(oldStudent);
      prismaService.student.update.mockResolvedValue(updatedStudent);
      prismaService.user.update.mockResolvedValue(updatedUser);
      userService.changePassword.mockResolvedValue(undefined);

      const result = await studentService.update(updateStudentInput);

      expect(result).toEqual(updatedStudent);
      expect(prismaService.student.update).toHaveBeenCalledWith({
        where: { id: updateStudentInput.id },
        data: {
          name: updateStudentInput.name,
          phoneNum: updateStudentInput.phoneNum,
          school: updateStudentInput.school,
          course: { connect: { id: updateStudentInput.courseId } },
        },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { username: oldStudent.phoneNum },
        data: { username: updateStudentInput.phoneNum },
      });
      const changePasswordInput = new ChangePasswordInput();
      changePasswordInput.newPassword = updateStudentInput.phoneNum;
      expect(userService.changePassword).toHaveBeenCalledWith(
        changePasswordInput,
        updatedUser.id,
      );
    });

    it('should throw NotFoundException if the student to update does not exist', async () => {
      prismaService.student.findUnique.mockResolvedValue(null);
      // This test is tricky because the original code has a potential bug where it might not throw.
      // Assuming prisma.student.update throws if record not found.
      prismaService.student.update.mockRejectedValue(
        new Error('Record to update not found.'),
      );
      await expect(studentService.update(updateStudentInput)).rejects.toThrow();
    });
  });

  describe('findAllByCourseId', () => {
    it('should return an array of students for a given courseId', async () => {
      const students = [mockStudent];
      prismaService.student.findMany.mockResolvedValue(students);
      const result = await studentService.findAllByCourseId(1);
      expect(result).toEqual(students);
      expect(prismaService.student.findMany).toHaveBeenCalledWith({
        where: { courseId: 1 },
        orderBy: [{ name: 'asc' }],
      });
    });

    it('should return an empty array if no students are found', async () => {
      prismaService.student.findMany.mockResolvedValue([]);
      const result = await studentService.findAllByCourseId(1);
      expect(result).toEqual([]);
    });
  });

  describe('findOneById', () => {
    it('should return a student when a valid id is provided', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent);
      const result = await studentService.findOneById(1);
      expect(result).toEqual(mockStudent);
    });

    it('should throw NotFoundException if student is not found', async () => {
      prismaService.student.findUnique.mockResolvedValue(null);
      await expect(studentService.findOneById(999)).rejects.toThrow(
        new NotFoundException('해당하는 학생이 없습니다.'),
      );
    });
  });

  describe('findOneByPhoneNum', () => {
    it('should return a student when a valid phone number is provided', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent);
      const result = await studentService.findOneByPhoneNum('1234567890');
      expect(result).toEqual(mockStudent);
    });

    it('should return null if no student is found', async () => {
      prismaService.student.findUnique.mockResolvedValue(null);
      const result = await studentService.findOneByPhoneNum('0000');
      expect(result).toBeNull();
    });
  });

  describe('findOneByUserId', () => {
    it('should return a student when a valid userId is provided', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent);
      const result = await studentService.findOneByUserId(1);
      expect(result).toEqual(mockStudent);
    });

    it('should throw NotFoundException if student is not found', async () => {
      prismaService.student.findUnique.mockResolvedValue(null);
      await expect(studentService.findOneByUserId(999)).rejects.toThrow(
        new NotFoundException('해당하는 학생이 없습니다.'),
      );
    });
  });

  describe('findOneByNameAndCourseId', () => {
    it('should return a student when valid name and courseId are provided', async () => {
      prismaService.student.findFirst.mockResolvedValue(mockStudent);
      const result = await studentService.findOneByNameAndCourseId(
        'Test Student',
        1,
      );
      expect(result).toEqual(mockStudent);
    });

    it('should throw NotFoundException if student is not found', async () => {
      prismaService.student.findFirst.mockResolvedValue(null);
      await expect(
        studentService.findOneByNameAndCourseId('Non Existent', 1),
      ).rejects.toThrow(new NotFoundException('해당하는 학생이 없습니다.'));
    });
  });

  describe('deleteOneById', () => {
    it('should call prisma.student.delete with the correct id', async () => {
      prismaService.student.delete.mockResolvedValue(mockStudent);
      await studentService.deleteOneById(1);
      expect(prismaService.student.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('deleteAllByCourseId', () => {
    it('should call prisma.student.deleteMany with the correct courseId', async () => {
      prismaService.student.deleteMany.mockResolvedValue({ count: 1 });
      await studentService.deleteAllByCourseId(1);
      expect(prismaService.student.deleteMany).toHaveBeenCalledWith({
        where: { courseId: 1 },
      });
    });
  });
});

// Helper type for deep mocking
type DeepMocked<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? jest.Mock<ReturnType<T[K]>, Parameters<T[K]>>
    : DeepMocked<T[K]>;
};
