import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  InitiateEmailRegisterDto,
  InitiatePhoneRegisterDto,
  CompleteEmailRegisterDto,
  CompletePhoneRegisterDto,
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
  @ApiBody({ type: InitiateEmailRegisterDto })
  @ApiOkResponse({ description: 'Verification code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Email already registered' })
  initiateEmailRegister(
    @Body() dto: InitiateEmailRegisterDto,
  ): Promise<{ message: string }> {
    return this.authService.initiateEmailRegister(dto);
  }

  @Post('email/register')
  @ApiOperation({
    summary: 'Complete email registration with verification code',
  })
  @ApiBody({ type: CompleteEmailRegisterDto })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid verification code' })
  completeEmailRegister(
    @Body() dto: CompleteEmailRegisterDto,
  ): Promise<AuthResponseDto> {
    return this.authService.completeEmailRegister(dto);
  }

  @Post('phone/code')
  @ApiOperation({ summary: 'Start registration process with phone' })
  @ApiBody({ type: InitiatePhoneRegisterDto })
  @ApiOkResponse({ description: 'Verification code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Phone number already registered' })
  initiatePhoneRegister(
    @Body() dto: InitiatePhoneRegisterDto,
  ): Promise<{ message: string }> {
    return this.authService.initiatePhoneRegister(dto);
  }

  @Post('phone/register')
  @ApiOperation({
    summary: 'Complete phone registration with verification code',
  })
  @ApiBody({ type: CompletePhoneRegisterDto })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid verification code' })
  completePhoneRegister(
    @Body() dto: CompletePhoneRegisterDto,
  ): Promise<AuthResponseDto> {
    return this.authService.completePhoneRegister(dto);
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
