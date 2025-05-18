import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Get,
} from '@nestjs/common';
import { SmsService } from './sms.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { SendSmsDto, SendBulkSmsDto } from './dto/send-sms.dto';

@ApiTags('SMS')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @ApiExcludeEndpoint()
  @Get('test-single')
  @ApiOperation({ summary: 'Test single SMS sending with template' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Test SMS sent successfully',
  })
  async testSingleMessage() {
    try {
      const smsDto: SendSmsDto = {
        to: '8801613506705',
        template: 'verification-code',
        context: {
          name: 'Test User',
          code: '123456',
          expiresIn: 10,
        },
        priority: 'high',
      };

      const result = await this.smsService.sendMessages(smsDto);

      return {
        status: HttpStatus.OK,
        message: 'Test SMS processed successfully',
        result,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }
  @ApiExcludeEndpoint()
  @Get('test-bulk')
  @ApiOperation({ summary: 'Test bulk SMS sending with templates' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Test bulk SMS sent successfully',
  })
  async testBulkMessage() {
    try {
      const bulkSmsDto: SendBulkSmsDto = {
        messages: [
          {
            to: '8801613506705',
            template: 'verification-code',
            context: {
              name: 'Test User 1',
              code: '123456',
              expiresIn: 10,
            },
            priority: 'normal',
          },
          {
            to: '8801866307230',
            template: 'reset-password',
            context: {
              name: 'Test User 2',
              code: '654321',
              expiresIn: 10,
            },
            priority: 'normal',
          },
        ],
      };

      const result = await this.smsService.sendMessages(bulkSmsDto.messages);

      return {
        status: HttpStatus.OK,
        message: 'Test SMS messages processed successfully',
        result,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }
}
