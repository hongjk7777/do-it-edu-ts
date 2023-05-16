import { AuthModule } from '@auth/auth.module';
import { Module } from '@nestjs/common';
import { UserModule } from '@user/user.module';
import { StudentResolver } from './resolver/student.resolver';
import { StudentService } from './service/student.service';

@Module({
  imports: [AuthModule, UserModule],
  providers: [StudentService, StudentResolver],
})
export class StudentModule {}
