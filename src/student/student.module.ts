import { Module } from '@nestjs/common';
import { StudentResolver } from './resolver/student.resolver';
import { StudentService } from './service/student.service';

@Module({
  providers: [StudentService, StudentResolver],
})
export class StudentModule {}
