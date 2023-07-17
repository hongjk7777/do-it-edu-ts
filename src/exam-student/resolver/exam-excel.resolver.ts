import { ExamExcelService } from '@exam-student/service/exam-excel.service';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

@Resolver()
export class ExamExcelResolver {
  constructor(private examExcelService: ExamExcelService) {}

  @Mutation(() => Boolean)
  async uploadExcel(
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  ) {
    // 파일 업로드 처리 로직 작성

    return true;
  }
}
