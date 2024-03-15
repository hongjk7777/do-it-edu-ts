import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignupInput } from '@auth/input/signup.input';
import { Test, TestingModule } from '@nestjs/testing';
import { User, UserRoleEnum } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from './user.service';
import { PasswordService } from '@auth/service/password-service.service';
import { InitPasswordInput } from '@auth/input/init-password.input';
import { ChangePasswordInput } from '@auth/input/change-password.input';

// Mock data
const mockUser: User = {
  id: 1,
  username: 'testuser',
  password: 'hashedpassword',
  role: UserRoleEnum.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UserService', () => {
  let userService: UserService;
  let prismaService: DeepMocked<PrismaService>;
  let passwordService: DeepMocked<PasswordService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: PasswordService,
          useValue: {
            hashPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get(PrismaService);
    passwordService = module.get(PasswordService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('save', () => {
    const signupInput: SignupInput = new SignupInput(
      'newuser',
      'newpassword',
    );

    it('should create and return a new user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);

      const result = await userService.save(signupInput);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: { ...signupInput },
      });
    });

    it('should throw ConflictException when username already exists', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(userService.save(signupInput)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  

  

  describe('findOneById', () => {
    it('should return a user when found', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.findOneById(1);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(userService.findOneById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneByUsername', () => {
    it('should return a user when found', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.findOneByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(userService.findOneByUsername('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteOneById', () => {
    it('should delete a user by id', async () => {
      prismaService.user.delete.mockResolvedValue(mockUser);

      await userService.deleteOneById(1);

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('deleteOneByPhoneNum', () => {
    it('should delete a user by phone number', async () => {
      prismaService.user.delete.mockResolvedValue(mockUser);

      await userService.deleteOneByPhoneNum('testuser');

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { username: 'testuser' },
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