import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PhoneRegisterDto } from './dto/phone-register.dto';
import {
  RequestEmailVerificationDto,
  VerifyEmailDto,
} from './dto/verify-email.dto';
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

  @Post('email/register')
  @ApiOperation({ summary: 'Register a new user with email' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('phone/register')
  @ApiOperation({ summary: 'Register a new user with phone number' })
  @ApiBody({ type: PhoneRegisterDto })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({
    description: 'User with this phone number already exists',
  })
  registerWithPhone(
    @Body() phoneRegisterDto: PhoneRegisterDto,
  ): Promise<AuthResponseDto> {
    return this.authService.registerWithPhone(phoneRegisterDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('email/verify/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request email verification code' })
  @ApiBody({ type: RequestEmailVerificationDto })
  @ApiOkResponse({ description: 'Verification code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid email or user not found' })
  requestEmailVerification(
    @Body() dto: RequestEmailVerificationDto,
  ): Promise<void> {
    return this.authService.requestEmailVerification(dto);
  }

  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with code' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiOkResponse({ description: 'Email verified successfully' })
  @ApiBadRequestResponse({ description: 'Invalid code or expired' })
  verifyEmail(@Body() dto: VerifyEmailDto): Promise<void> {
    return this.authService.verifyEmail(dto);
  }

  @Post('password/reset/request')
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with code' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ description: 'Password reset successfully' })
  @ApiBadRequestResponse({ description: 'Invalid code or expired' })
  resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(dto);
  }
}
