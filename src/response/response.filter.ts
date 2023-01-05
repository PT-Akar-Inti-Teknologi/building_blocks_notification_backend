import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { MessageService } from 'src/message/message.service';
import { ResponseErrorInterface } from './response.interface';

// Restructure Response Object For Guard Exception
@Catch(HttpException)
export class ResponseFilter implements ExceptionFilter {
  constructor(private readonly messageService: MessageService) {}

  catch(exception: any, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: any = ctx.getResponse();

    if (exception instanceof HttpException) {
      const status: number = exception.getStatus();
      response.status(status).json(exception.getResponse());
    } else {
      if (exception.statusCode) {
        const errorStatusCodeResponse: ResponseErrorInterface = {
          response_schema: {
            response_code: exception.statusCode.toString(),
            response_message: exception.message,
          },
          response_output: {
            errors: exception.error,
          },
        };
        response.status(exception.statusCode).json(errorStatusCodeResponse);
      }
      // if error is not http cause
      const status: number = HttpStatus.INTERNAL_SERVER_ERROR;
      const errorResponse: ResponseErrorInterface = {
        response_schema: {
          response_code: status.toString(),
          response_message: this.messageService.get(
            'http.serverError.internalServerError',
          ),
        },
        response_output: null,
      };

      response.status(status).json(errorResponse);
    }
  }
}
