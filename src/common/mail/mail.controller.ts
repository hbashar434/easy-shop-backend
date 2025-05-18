import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Get,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto, SendBulkMailDto } from './dto/send-mail.dto';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @ApiExcludeEndpoint()
  @Get('test-single')
  @ApiOperation({ summary: 'Test single email sending' })
  async testSingleMail() {
    console.log('Test single mail endpoint hit');
    try {
      const result = await this.mailService.sendMails({
        to: 'habib.bashar.dd@gmail.com',
        subject: 'Test Email',
        template: 'welcome',
        context: {
          name: 'Habib Bashar',
          email: 'habib.bashar.dd@gmail.com',
          url: 'http://example.com',
          year: new Date().getFullYear(),
        },
        priority: 'high',
      });
      console.log('Result:', result);

      return {
        status: HttpStatus.OK,
        message: 'Test email processed successfully',
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
  @ApiOperation({ summary: 'Test bulk email sending' })
  async testBulkMail() {
    try {
      const result = await this.mailService.sendMails([
        {
          to: 'habibbashar.biz@gmail.com',
          subject: 'Test Email 1',
          template: 'welcome',
          context: {
            name: 'Habib Bashar 2',
            email: 'habibbashar.biz@gmail.com',
            url: 'http://example.com',
            year: new Date().getFullYear(),
          },
          priority: 'normal',
        },
        {
          to: 'saj121434131@gmail.com',
          subject: 'Test Email 3',
          template: 'welcome',
          context: {
            name: 'Habib Bashar 3',
            email: 'saj121434131@gmail.com',
            url: 'http://example.com',
            year: new Date().getFullYear(),
          },
          priority: 'normal',
        },
      ]);

      return {
        status: HttpStatus.OK,
        message: 'Test emails processed successfully',
        result,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }
}
