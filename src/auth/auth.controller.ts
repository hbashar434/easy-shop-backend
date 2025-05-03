import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  EmailCodeDto,
  PhoneCodeDto,
  RegisterWithEmailDto,
  RegisterWithPhoneDto,
} from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
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

  @Post('login/password')
  @ApiOperation({ summary: 'Login with password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  loginWithPassword(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.loginWithPassword(
      loginDto.identifier,
      loginDto.password,
    );
  }

  @Post('login/otp')
  @ApiOperation({ summary: 'Login with OTP' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'User successfully logged in or verification code sent',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  loginWithOTP(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.loginWithOTP(
      loginDto.identifier,
      loginDto.verificationCode,
    );
  }

  @Post('password/reset/request')
  @ApiOperation({ summary: 'Request password reset code' })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiOkResponse({ description: 'Reset code sent successfully' })
  @ApiBadRequestResponse({
    description: 'Invalid email/phone or user not found',
  })
  requestPasswordReset(@Body() dto: RequestPasswordResetDto): Promise<void> {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('password/reset')
  @ApiOperation({ summary: 'Reset password with code' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ description: 'Password reset successfully' })
  @ApiBadRequestResponse({ description: 'Invalid code or expired' })
  resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(dto);
  }
}
