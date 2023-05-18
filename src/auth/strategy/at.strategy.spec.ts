import { JwtDto } from '@auth/dto/jwt.dto';
import UserInfo from '@auth/dto/user-info.dto';
import { AuthService } from '@auth/service/auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AtStrategy } from './at.strategy';

describe('AtStrategy', () => {
  let authService: AuthService;
  let atStrategy: AtStrategy;

  beforeEach(async () => {
    const authServiceMock = {
      validateUser: jest.fn(),
    };
    const configServiceMock = {
      get: jest.fn().mockReturnValue('secret'),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AtStrategy,
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    atStrategy = moduleRef.get<AtStrategy>(AtStrategy);
  });

  describe('validate', () => {
    it('should throw unauthorized exception if user info is null', async () => {
      const payload = { userId: 123, expirationTime: 1, issuedAt: 3 };
      const userInfo = null;
      const jwtDto: JwtDto = {
        userId: payload.userId,
        expirationTime: payload.expirationTime,
        issuedAt: payload.issuedAt,
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(userInfo);

      await expect(atStrategy.validate(jwtDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user info if user info is not null', async () => {
      const payload = { userId: 123, expirationTime: 1, issuedAt: 3 };
      const userInfo = { id: 123, username: 'test' } as UserInfo;
      const jwtDto: JwtDto = {
        userId: payload.userId,
        expirationTime: payload.expirationTime,
        issuedAt: payload.issuedAt,
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(userInfo);

      const result = await atStrategy.validate(jwtDto);

      expect(result.id).toEqual(123);
      expect(result.username).toEqual('test');
    });
  });
});
