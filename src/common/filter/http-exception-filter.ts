import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let body: string = exception.message;
    if (exception.status === HttpStatus.BAD_REQUEST) {
      body = exception.response.message.join(',');
    }

    response
      .status(exception.status || HttpStatus.INTERNAL_SERVER_ERROR)
      .send(body);
  }
}
