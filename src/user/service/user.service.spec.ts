import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignupInput } from '@auth/input/signup.input';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService, ConfigService],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('save', () => {
    it('should throw bad reqeust error when duplicated user', async () => {
      const user = { username: 'testUser', password: 'testPassword' };

      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user as User);

      await expect(
        userService.save(new SignupInput('usename', 'password')),
      ).rejects.toThrowError(ConflictException);
    });
  });

  describe('findOneById', () => {
    it('should throw bad reqeust error when student is not exist', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(userService.findOneById(1)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('findOneByUsername', () => {
    it('should throw bad reqeust error when student is not exist', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(
        userService.findOneByUsername('testUser'),
      ).rejects.toThrowError(NotFoundException);
    });
  });
});
