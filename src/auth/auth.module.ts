import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './service/auth.service';
import { LocalStrategy } from './strategy/local.strategy';
import { PasswordService } from './service/password-service.service';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy } from './strategy/at.strategy';
import { TokenService } from './service/token.service';
import { AuthResolver } from './resolver/auth.resolver';
import { UserModule } from '@user/user.module';

@Module({
  imports: [UserModule, PassportModule, JwtModule.register({})],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    LocalStrategy,
    AtStrategy,
    AuthResolver,
  ],
  controllers: [],
})
export class AuthModule {}
