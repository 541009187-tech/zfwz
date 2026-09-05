import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import type { ExceptionResponse } from '../interfaces/exception.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as ExceptionResponse | string;
      message = typeof res === 'string' ? res : (res.message || res.error || 'Error');
    } else {
      const error = exception as Error;
      this.logger.error(error.message, error.stack);
      message = error.message || 'Internal server error';
    }

    response.status(status).json({
      code: status,
      message,
      data: null,
    });
  }
}
