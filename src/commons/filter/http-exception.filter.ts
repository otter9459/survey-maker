import { Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException) {
    console.log('====================================');
    console.log('예외 발생');
    console.log(exception);
    console.log('예외 내용: ', exception.message);
    console.log('예외 코드: ', exception.getStatus());
    console.log('====================================');
  }
}
