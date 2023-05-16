import { AuthService } from '@auth/service/auth.service';
import { PasswordService } from '@auth/service/password-service.service';
import { TokenService } from '@auth/service/token.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from '@student/service/student.service';
import { UserService } from '@user/service/user.service';
import { PrismaService } from 'nestjs-prisma';
import { StudentResolver } from './student.resolver';

describe('StudentResolver', () => {
  let resolver: StudentResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],

      providers: [
        StudentResolver,
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

    resolver = module.get<StudentResolver>(StudentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
