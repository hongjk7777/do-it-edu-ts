import { AuthModule } from '@auth/auth.module';
import { AuthService } from '@auth/service/auth.service';
import { PasswordService } from '@auth/service/password-service.service';
import { TokenService } from '@auth/service/token.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@user/service/user.service';
import { PrismaService } from 'nestjs-prisma';
import { StudentService } from './student.service';

describe('StudentService', () => {
  let service: StudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],

      providers: [
        StudentService,
        AuthService,
        UserService,
        PasswordService,
        TokenService,
        PrismaService,
        ConfigService,
        JwtService,
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
