import { PasswordService } from '@auth/service/password-service.service';
import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';

@Module({
  providers: [UserService, PasswordService],
  exports: [UserService],
})
export class UserModule {}
