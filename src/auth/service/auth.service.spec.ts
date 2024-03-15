import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PasswordService } from './password-service.service';
import { TokenService } from './token.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'nestjs-prisma';
import { CacheModule } from '@nestjs/cache-manager';
import { UserService } from '@user/service/user.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Token } from '@auth/domain/token.model';
import { User, UserRoleEnum } from '@prisma/client';
import { SignupInput } from '@auth/input/signup.input';
import UserInfo from '../dto/user-info.dto';

// Mock data
const mockUser: User = {
  id: 1,
  username: 'testuser',
  password: 'hashedpassword',
  role: UserRoleEnum.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockToken: Token = {
  accessToken: 'access_token',
  expiresIn: 3600,
  refreshToken: 'refresh_token',
  refreshIn: 86400,
  userRole: UserRoleEnum.USER,
};

describe('AuthService', () => {
  let authService: AuthService;
  let userService: DeepMocked<UserService>;
  let passwordService: DeepMocked<PasswordService>;
  let tokenService: DeepMocked<TokenService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOneById: jest.fn(),
            findOneByUsername: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            validatePassword: jest.fn(),
            hashPassword: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateTokens: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    passwordService = module.get(PasswordService);
    tokenService = module.get(TokenService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return UserInfo when user is found', async () => {
      userService.findOneById.mockResolvedValue(mockUser);

      const result = await authService.validateUser(1);

      expect(result).toEqual(new UserInfo(mockUser));
      expect(userService.findOneById).toHaveBeenCalledWith(1);
    });

    
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      userService.findOneByUsername.mockResolvedValue(mockUser);
      passwordService.validatePassword.mockResolvedValue(true);
      tokenService.generateTokens.mockResolvedValue(mockToken);

      const result = await authService.login('testuser', 'password');

      expect(result).toEqual(mockToken);
      expect(userService.findOneByUsername).toHaveBeenCalledWith('testuser');
      expect(passwordService.validatePassword).toHaveBeenCalledWith(
        'password',
        mockUser.password,
      );
      expect(tokenService.generateTokens).toHaveBeenCalledWith({
        userId: mockUser.id.toString(),
        userRole: mockUser.role,
      });
    });

    it('should throw BadRequestException when password is invalid', async () => {
      userService.findOneByUsername.mockResolvedValue(mockUser);
      passwordService.validatePassword.mockResolvedValue(false);

      await expect(authService.login('testuser', 'wrongpassword')).rejects.toThrow(
        BadRequestException,
      );
    });

    
  });

  describe('signUp', () => {
    const signupInput: SignupInput = new SignupInput(
      'newuser',
      'newpassword',
    );

    it('should return tokens on successful signup', async () => {
      passwordService.hashPassword.mockResolvedValue('hashednewpassword');
      userService.save.mockResolvedValue(mockUser);
      tokenService.generateTokens.mockResolvedValue(mockToken);

      const result = await authService.signUp(signupInput);

      expect(result).toEqual(mockToken);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        signupInput.password,
      );
      expect(userService.save).toHaveBeenCalledWith(
        SignupInput.of(signupInput.username, 'hashednewpassword'),
      );
      expect(tokenService.generateTokens).toHaveBeenCalledWith({
        userId: mockUser.id.toString(),
        userRole: mockUser.role,
      });
    });

    it('should throw ConflictException when username already exists', async () => {
      passwordService.hashPassword.mockResolvedValue('hashednewpassword');
      userService.save.mockRejectedValue(new ConflictException());

      await expect(authService.signUp(signupInput)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('signUpStudent', () => {
    const signupInput: SignupInput = new SignupInput(
      'studentuser',
      'studentpassword',
    );

    it('should return User on successful student signup', async () => {
      passwordService.hashPassword.mockResolvedValue('hashedstudentpassword');
      userService.save.mockResolvedValue(mockUser);

      const result = await authService.signUpStudent(signupInput);

      expect(result).toEqual(mockUser);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        signupInput.username,
      );
      expect(userService.save).toHaveBeenCalledWith(
        SignupInput.of(signupInput.username, 'hashedstudentpassword'),
      );
    });
  });
});

// Helper type for deep mocking
type DeepMocked<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? jest.Mock<ReturnType<T[K]>, Parameters<T[K]>>
    : DeepMocked<T[K]>;
};
