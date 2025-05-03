import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  EmailCodeDto,
  PhoneCodeDto,
  RegisterWithEmailDto,
  RegisterWithPhoneDto,
} from './dto/register.dto';
import {
  EmailPasswordLoginDto,
  EmailOtpLoginDto,
  PhonePasswordLoginDto,
  PhoneOtpLoginDto,
} from './dto/login.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
} from './dto/reset-password.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('email/code')
  @ApiOperation({ summary: 'Start registration process with email' })
  @ApiBody({ type: EmailCodeDto })
  @ApiOkResponse({ description: 'Verification code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Email already registered' })
  sendEmailCode(@Body() dto: EmailCodeDto): Promise<{ message: string }> {
    return this.authService.sendEmailCode(dto);
  }

  @Post('email/register')
  @ApiOperation({
    summary: 'Complete email registration with verification code',
  })
  @ApiBody({ type: RegisterWithEmailDto })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid verification code' })
  registerWithEmail(
    @Body() dto: RegisterWithEmailDto,
  ): Promise<AuthResponseDto> {
    return this.authService.registerWithEmail(dto);
  }

  @Post('email/password/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: EmailPasswordLoginDto })
  @ApiOkResponse({
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  loginWithEmailPassword(
    @Body() dto: EmailPasswordLoginDto,
  ): Promise<AuthResponseDto> {
    return this.authService.loginWithEmailPassword(dto.email, dto.password);
  }

  @Post('email/otp/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and OTP' })
  @ApiBody({ type: EmailOtpLoginDto })
  @ApiOkResponse({
    description: 'User successfully logged in or verification code sent',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  loginWithEmailOtp(@Body() dto: EmailOtpLoginDto): Promise<AuthResponseDto> {
    return this.authService.loginWithEmailOtp(dto.email, dto.verificationCode);
  }

  @Post('phone/code')
  @ApiOperation({ summary: 'Start registration process with phone' })
  @ApiBody({ type: PhoneCodeDto })
  @ApiOkResponse({ description: 'Verification code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Phone number already registered' })
  sendPhoneCode(@Body() dto: PhoneCodeDto): Promise<{ message: string }> {
    return this.authService.sendPhoneCode(dto);
  }

  @Post('phone/register')
  @ApiOperation({
    summary: 'Complete phone registration with verification code',
  })
  @ApiBody({ type: RegisterWithPhoneDto })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid verification code' })
  registerWithPhone(
    @Body() dto: RegisterWithPhoneDto,
  ): Promise<AuthResponseDto> {
    return this.authService.registerWithPhone(dto);
  }

  @Post('phone/password/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with phone and password' })
  @ApiBody({ type: PhonePasswordLoginDto })
  @ApiOkResponse({
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  loginWithPhonePassword(
    @Body() dto: PhonePasswordLoginDto,
  ): Promise<AuthResponseDto> {
    return this.authService.loginWithPhonePassword(dto.phone, dto.password);
  }

  @Post('phone/otp/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with phone and OTP' })
  @ApiBody({ type: PhoneOtpLoginDto })
  @ApiOkResponse({
    description: 'User successfully logged in or verification code sent',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  loginWithPhoneOtp(@Body() dto: PhoneOtpLoginDto): Promise<AuthResponseDto> {
    return this.authService.loginWithPhoneOtp(dto.phone, dto.verificationCode);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Tokens refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  refreshTokens(
    @Body('refreshToken') refreshToken: string,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('email/password/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset via email' })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiOkResponse({ description: 'Reset code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid email' })
  async requestEmailPasswordReset(
    @Body('email') email: string,
  ): Promise<{ message: string }> {
    return this.authService.requestEmailPasswordReset(email);
  }

  @Post('email/password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using email and reset code' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ description: 'Password reset successful' })
  @ApiBadRequestResponse({ description: 'Invalid or expired reset code' })
  async resetEmailPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    if (!dto.email || !dto.code || !dto.newPassword) {
      throw new BadRequestException(
        'Email, code and new password are required',
      );
    }
    return this.authService.emailPasswordReset(
      dto.email,
      dto.code,
      dto.newPassword,
    );
  }

  @Post('phone/password/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset via phone' })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiOkResponse({ description: 'Reset code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid phone number' })
  async requestPhonePasswordReset(
    @Body('phone') phone: string,
  ): Promise<{ message: string }> {
    return this.authService.requestPhonePasswordReset(phone);
  }

  @Post('phone/password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using phone and reset code' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ description: 'Password reset successful' })
  @ApiBadRequestResponse({ description: 'Invalid or expired reset code' })
  async resetPhonePassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    if (!dto.phone || !dto.code || !dto.newPassword) {
      throw new BadRequestException(
        'Phone, code and new password are required',
      );
    }
    return this.authService.phonePasswordReset(
      dto.phone,
      dto.code,
      dto.newPassword,
    );
  }
}
