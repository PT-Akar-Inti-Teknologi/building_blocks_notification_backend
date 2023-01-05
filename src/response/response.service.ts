import {BadRequestException, HttpStatus, Injectable} from '@nestjs/common';
import {
  ErrorMessageInterface,
  PaginationInterface,
  ResponseErrorInterface,
  ResponseSuccessCollectionInterface,
  ResponseSuccessPaginationInterface,
  ResponseSuccessSingleInterface,
} from './response.interface';

@Injectable()
export class ResponseService {
  responseCode(statusCode: number) {
    return `${process.env.PROJECT_NAME}-${statusCode.toString()}`;
  }

  error(
    statusCode: number,
    messages: ErrorMessageInterface[],
    error: string,
  ): ResponseErrorInterface {
    const response: ResponseErrorInterface = {
      response_schema: {
        response_code: this.responseCode(statusCode),
        response_message: error,
      },
      response_output: {
        errors: messages,
      },
    };
    return response;
  }

  successCollection(
    content: any[],
    pagination?: PaginationInterface,
    message?: string,
  ): ResponseSuccessCollectionInterface | ResponseSuccessPaginationInterface {
    if (!pagination) {
      pagination = null;
    }
    if (!message) {
      message = 'Success';
    }
    const response: ResponseSuccessPaginationInterface = {
      response_schema: {
        response_code: this.responseCode(HttpStatus.OK),
        response_message: message,
      },
      response_output: {
        list: {
          pagination,
          content,
        },
      },
    };
    return response;
  }

  success(content: any, message?: string): ResponseSuccessSingleInterface {
    if (!message) {
      message = 'Success';
    }
    const response: ResponseSuccessSingleInterface = {
      response_schema: {
        response_code: this.responseCode(HttpStatus.OK),
        response_message: message,
      },
      response_output: {
        detail: content,
      },
    };
    return response;
  }

  throwError(error: any) {
    if (error.response?.response_schema?.response_code) {
      throw new BadRequestException(error.response);
    }
    const errorMessage: ErrorMessageInterface = {
      field: '',
      message: error.message,
    };
    throw new BadRequestException(
      this.error(
        HttpStatus.INTERNAL_SERVER_ERROR,
        [errorMessage],
        'Internal Server Error',
      ),
    );
  }
}
