import { Token } from '@auth/domain/token.model';
import { AuthService } from '@auth/service/auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';

describe('RtStrategy', () => {
  let authService: AuthService;
  let localStrategy: LocalStrategy;

  beforeEach(async () => {
    const authServiceMock = {
      login: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    localStrategy = moduleRef.get<LocalStrategy>(LocalStrategy);
  });

  describe('validate', () => {
    it('should throw unauthorized exception if user info is null', async () => {
      const payload = { username: 'testUser', password: 'testPw' };
      const userInfo = null;

      jest.spyOn(authService, 'login').mockResolvedValue(userInfo);

      await expect(
        localStrategy.validate(payload.username, payload.password),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user info if user info is not null', async () => {
      const payload = { username: 'testUser', password: 'testPw' };
      const userInfo = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      } as Token;

      jest.spyOn(authService, 'login').mockResolvedValue(userInfo);

      const result = await localStrategy.validate(
        payload.username,
        payload.password,
      );

      expect(result.accessToken).toEqual('accessToken');
      expect(result.refreshToken).toEqual('refreshToken');
    });
  });
});
