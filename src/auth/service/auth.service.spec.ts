import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PasswordService } from './password-service.service';
import { TokenService } from './token.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'nestjs-prisma';
import { CacheModule } from '@nestjs/cache-manager';
import { UserService } from '@user/service/user.service';
import { BadRequestException } from '@nestjs/common';
import { Token } from '@auth/domain/token.model';
import { User } from '@prisma/client';
import { SignupInput } from '@auth/input/signup.input';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let passwordService: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        AuthService,
        UserService,
        PasswordService,
        TokenService,
        PrismaService,
        ConfigService,
        JwtService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    passwordService = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should throw bad request error when user id is invalid', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(authService.validateUser(0)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should throw bad request error when password is invalid', async () => {
      jest.spyOn(passwordService, 'validatePassword').mockResolvedValue(false);
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue({ id: 1 } as User);

      await expect(authService.login('username', 'password')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('signup', () => {
    it('should throw bad request error when duplicated phone number user', async () => {
      jest
        .spyOn(passwordService, 'hashPassword')
        .mockResolvedValue('hashedPassword');
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue({ id: 1 } as User);

      await expect(
        authService.signUp(new SignupInput('test', 'password')),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
