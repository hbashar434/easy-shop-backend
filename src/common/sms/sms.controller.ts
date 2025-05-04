import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Get,
} from '@nestjs/common';
import { SmsService } from './sms.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SendSmsDto, SendBulkSmsDto } from './dto/send-sms.dto';

@ApiTags('SMS')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Get('test-single')
  @ApiOperation({ summary: 'Test single SMS sending' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Test SMS sent successfully',
  })
  async testSingleMessage() {
    try {
      const smsDto: SendSmsDto = {
        to: '8801613506705',
        content: 'Test SMS from My Shop',
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

  @Get('test-bulk')
  @ApiOperation({ summary: 'Test bulk SMS sending' })
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
            content: 'Test SMS 1 from My Shop',
            priority: 'normal',
          },
          {
            to: '8801866307230',
            content: 'Test SMS 2 from My Shop',
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
