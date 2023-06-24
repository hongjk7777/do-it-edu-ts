import { PasswordService } from '@auth/service/password-service.service';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from './service/user.service';

@Module({
  providers: [UserService, PasswordService, ConfigService],
  exports: [UserService],
})
export class UserModule {}
