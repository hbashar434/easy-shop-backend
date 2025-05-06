import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Request,
  Get,
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
  RequestEmailPasswordResetDto,
  ResetEmailPasswordDto,
  RequestPhonePasswordResetDto,
  ResetPhonePasswordDto,
} from './dto/reset-password.dto';
import {
  EmailVerifyRequestDto,
  PhoneVerifyRequestDto,
  VerifyEmailDto,
  VerifyPhoneDto,
} from './dto/verify.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiExcludeEndpoint,
  ApiBearerAuth,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import {
  RequestCodeDto,
  RegisterWithCodeDto,
  PasswordLoginDto,
  OtpLoginDto,
  VerifyDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  RequestVerifyDto,
} from './dto/unified-auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RequestWithUser } from './interfaces/auth.interface';
import { validate as validateEmail } from 'email-validator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // New unified endpoints
  @Post('code')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request verification code (email/phone)' })
  @ApiBody({ type: RequestCodeDto })
  @ApiOkResponse({ description: 'Verification code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({
    description: 'User not found. Please create an account.',
  })
  @ApiBearerAuth()
  async requestCode(@Body() dto: RequestCodeDto): Promise<{ message: string }> {
    if (!dto?.identifier) {
      throw new BadRequestException('Identifier is required');
    }

    const isEmail = validateEmail(dto.identifier);
    return isEmail
      ? this.authService.sendEmailCode({ email: dto.identifier })
      : this.authService.sendPhoneCode({ phone: dto.identifier });
  }

  @Post('request/register')
  @ApiOperation({ summary: 'Request verification code (email/phone)' })
  @ApiBody({ type: RequestCodeDto })
  @ApiOkResponse({ description: 'Verification code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Identifier already registered' })
  async requestRegister(
    @Body() dto: RequestCodeDto,
  ): Promise<{ message: string }> {
    if (!dto?.identifier) {
      throw new BadRequestException('Identifier is required');
    }

    const isEmail = validateEmail(dto.identifier);
    return isEmail
      ? this.authService.requestRegisterWithEmail({ email: dto.identifier })
      : this.authService.requestRegisterWithPhone({ phone: dto.identifier });
  }

  @Post('register')
  @ApiOperation({ summary: 'Complete registration with verification code' })
  @ApiBody({ type: RegisterWithCodeDto })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid verification code' })
  async register(@Body() dto: RegisterWithCodeDto): Promise<AuthResponseDto> {
    if (!dto?.identifier || !dto?.code) {
      throw new BadRequestException('Identifier and code are required');
    }

    const isEmail = validateEmail(dto.identifier);
    return isEmail
      ? this.authService.registerWithEmail({
          email: dto.identifier,
          code: dto.code,
        })
      : this.authService.registerWithPhone({
          phone: dto.identifier,
          code: dto.code,
        });
  }

  @Post('password/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with password' })
  @ApiBody({ type: PasswordLoginDto })
  @ApiOkResponse({
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async passwordLogin(@Body() dto: PasswordLoginDto): Promise<AuthResponseDto> {
    if (!dto?.identifier || !dto?.password) {
      throw new BadRequestException('Identifier and password are required');
    }

    const isEmail = validateEmail(dto.identifier);
    return isEmail
      ? this.authService.loginWithEmailPassword({
          email: dto.identifier,
          password: dto.password,
        })
      : this.authService.loginWithPhonePassword({
          phone: dto.identifier,
          password: dto.password,
        });
  }

  @Post('otp/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with OTP' })
  @ApiBody({ type: OtpLoginDto })
  @ApiOkResponse({
    description: 'User successfully logged in or verification code sent',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async otpLogin(@Body() dto: OtpLoginDto): Promise<AuthResponseDto> {
    if (!dto?.identifier) {
      throw new BadRequestException('Identifier is required');
    }

    const isEmail = validateEmail(dto.identifier);
    // Handle the optional code parameter
    if (!dto.code) {
      // If no code provided, this is a request for OTP
      return isEmail
        ? this.authService.loginWithEmailOtp({
            email: dto.identifier,
            code: '',
          })
        : this.authService.loginWithPhoneOtp({
            phone: dto.identifier,
            code: '',
          });
    }

    return isEmail
      ? this.authService.loginWithEmailOtp({
          email: dto.identifier,
          code: dto.code,
        })
      : this.authService.loginWithPhoneOtp({
          phone: dto.identifier,
          code: dto.code,
        });
  }

  @Post('verify/request')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request verification for email/phone' })
  @ApiBody({ type: RequestVerifyDto })
  @ApiOkResponse({ description: 'Verification code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiBearerAuth()
  async requestVerification(
    @Request() req: RequestWithUser,
    @Body() dto: RequestVerifyDto,
  ): Promise<{ message: string }> {
    if (!dto?.identifier) {
      throw new BadRequestException('Identifier is required');
    }

    const isEmail = validateEmail(dto.identifier);
    return isEmail
      ? this.authService.requestEmailVerify(req.user.sub, dto.identifier)
      : this.authService.requestPhoneVerify(req.user.sub, dto.identifier);
  }
  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email/phone' })
  @ApiBody({ type: VerifyDto })
  @ApiOkResponse({ description: 'Verification successful' })
  @ApiBadRequestResponse({ description: 'Invalid verification code' })
  @ApiBearerAuth()
  async verify(@Body() dto: VerifyDto): Promise<{ message: string }> {
    if (!dto?.identifier || !dto?.code) {
      throw new BadRequestException('Identifier and code are required');
    }

    const isEmail = validateEmail(dto.identifier);
    return isEmail
      ? this.authService.verifyEmail({
          email: dto.identifier,
          code: dto.code,
        })
      : this.authService.verifyPhone({
          phone: dto.identifier,
          code: dto.code,
        });
  }

  @Post('password/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiOkResponse({ description: 'Reset code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid identifier' })
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    if (!dto?.identifier) {
      throw new BadRequestException('Identifier is required');
    }

    const isEmail = validateEmail(dto.identifier);
    return isEmail
      ? this.authService.requestEmailPasswordReset({
          email: dto.identifier,
        })
      : this.authService.requestPhonePasswordReset({
          phone: dto.identifier,
        });
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using code' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ description: 'Password reset successful' })
  @ApiBadRequestResponse({ description: 'Invalid or expired reset code' })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    if (!dto?.identifier || !dto?.code || !dto?.newPassword) {
      throw new BadRequestException(
        'Identifier, code and new password are required',
      );
    }

    const isEmail = validateEmail(dto.identifier);
    return isEmail
      ? this.authService.emailPasswordReset({
          email: dto.identifier,
          code: dto.code,
          newPassword: dto.newPassword,
        })
      : this.authService.phonePasswordReset({
          phone: dto.identifier,
          code: dto.code,
          newPassword: dto.newPassword,
        });
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

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiOkResponse({ description: 'User logged out successfully' })
  @ApiBearerAuth()
  async logout(@Request() req: RequestWithUser): Promise<{ message: string }> {
    return this.authService.logout(req.user.sub);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get authenticated user information' })
  @ApiOkResponse({ description: 'User information retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBearerAuth()
  async getCurrentUser(@Request() req: RequestWithUser) {
    return await this.authService.getCurrentUser(req.user.sub);
  }

  /////////////////////////////////////////////////////////////////
  // TODO: From this point onward, all APIs are excluded from Swagger using @ApiExcludeEndpoint().
  // These endpoints are internal/special-case APIs. They are not part of the main unified API
  // and should NOT be publicly documented or used unless specifically required for a use case.
  // They are kept here for reference and potential future use.

  @ApiExcludeEndpoint()
  @Post('email/code')
  @ApiOperation({ summary: 'Start registration process with email' })
  @ApiBody({ type: EmailCodeDto })
  @ApiOkResponse({ description: 'Verification code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({
    description: 'User not found. Please create an account.',
  })
  async sendEmailCode(@Body() dto: EmailCodeDto): Promise<{ message: string }> {
    return await this.authService.sendEmailCode(dto);
  }

  @ApiExcludeEndpoint()
  @Post('email/register/request')
  @ApiOperation({ summary: 'Start registration process with email' })
  @ApiBody({ type: EmailCodeDto })
  @ApiOkResponse({ description: 'Verification code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Email already registered' })
  async requestRegisterWithEmail(
    @Body() dto: EmailCodeDto,
  ): Promise<{ message: string }> {
    return await this.authService.requestRegisterWithEmail(dto);
  }

  @ApiExcludeEndpoint()
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
  async registerWithEmail(
    @Body() dto: RegisterWithEmailDto,
  ): Promise<AuthResponseDto> {
    return await this.authService.registerWithEmail(dto);
  }
  @ApiExcludeEndpoint()
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
  async loginWithEmailPassword(
    @Body() dto: EmailPasswordLoginDto,
  ): Promise<AuthResponseDto> {
    return await this.authService.loginWithEmailPassword(dto);
  }
  @ApiExcludeEndpoint()
  @Post('email/otp/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and OTP' })
  @ApiBody({ type: EmailOtpLoginDto })
  @ApiOkResponse({
    description: 'User successfully logged in or verification code sent',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async loginWithEmailOtp(
    @Body() dto: EmailOtpLoginDto,
  ): Promise<AuthResponseDto> {
    return await this.authService.loginWithEmailOtp(dto);
  }

  @ApiExcludeEndpoint()
  @Post('email/verify/request')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request email verification' })
  @ApiBody({ type: EmailVerifyRequestDto })
  @ApiOkResponse({ description: 'Verification code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid email' })
  @ApiBearerAuth()
  async requestEmailVerification(
    @Request() req: RequestWithUser,
    @Body() dto: EmailVerifyRequestDto,
  ): Promise<{ message: string }> {
    return this.authService.requestEmailVerify(req.user.sub, dto.email);
  }

  @ApiExcludeEndpoint()
  @Post('email/verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiOkResponse({ description: 'Email verified successfully' })
  @ApiBadRequestResponse({ description: 'Invalid verification code' })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<{ message: string }> {
    return await this.authService.verifyEmail(dto);
  }

  @ApiExcludeEndpoint()
  @Post('email/password/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset via email' })
  @ApiBody({ type: RequestEmailPasswordResetDto })
  @ApiOkResponse({ description: 'Reset code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid email' })
  async requestEmailPasswordReset(
    @Body() dto: RequestEmailPasswordResetDto,
  ): Promise<{ message: string }> {
    return await this.authService.requestEmailPasswordReset(dto);
  }
  @ApiExcludeEndpoint()
  @Post('email/password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using email and reset code' })
  @ApiBody({ type: ResetEmailPasswordDto })
  @ApiOkResponse({ description: 'Password reset successful' })
  @ApiBadRequestResponse({ description: 'Invalid or expired reset code' })
  async resetEmailPassword(
    @Body() dto: ResetEmailPasswordDto,
  ): Promise<{ message: string }> {
    return await this.authService.emailPasswordReset(dto);
  }

  @ApiExcludeEndpoint()
  @Post('phone/code')
  @ApiOperation({ summary: 'Start registration process with phone' })
  @ApiBody({ type: PhoneCodeDto })
  @ApiOkResponse({ description: 'Verification code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({
    description: 'User not found. Please create an account.',
  })
  async sendPhoneCode(@Body() dto: PhoneCodeDto): Promise<{ message: string }> {
    return await this.authService.sendPhoneCode(dto);
  }

  @ApiExcludeEndpoint()
  @Post('phone/code')
  @ApiOperation({ summary: 'Start registration process with phone' })
  @ApiBody({ type: PhoneCodeDto })
  @ApiOkResponse({ description: 'Verification code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Phone number already registered' })
  async requestRegisterWithPhone(
    @Body() dto: PhoneCodeDto,
  ): Promise<{ message: string }> {
    return await this.authService.requestRegisterWithPhone(dto);
  }
  @ApiExcludeEndpoint()
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
  async registerWithPhone(
    @Body() dto: RegisterWithPhoneDto,
  ): Promise<AuthResponseDto> {
    return await this.authService.registerWithPhone(dto);
  }
  @ApiExcludeEndpoint()
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
  async loginWithPhonePassword(
    @Body() dto: PhonePasswordLoginDto,
  ): Promise<AuthResponseDto> {
    return await this.authService.loginWithPhonePassword(dto);
  }
  @ApiExcludeEndpoint()
  @Post('phone/otp/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with phone and OTP' })
  @ApiBody({ type: PhoneOtpLoginDto })
  @ApiOkResponse({
    description: 'User successfully logged in or verification code sent',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async loginWithPhoneOtp(
    @Body() dto: PhoneOtpLoginDto,
  ): Promise<AuthResponseDto> {
    return await this.authService.loginWithPhoneOtp(dto);
  }

  @ApiExcludeEndpoint()
  @Post('phone/verify/request')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request phone verification' })
  @ApiBody({ type: PhoneVerifyRequestDto })
  @ApiOkResponse({ description: 'Verification code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid phone number' })
  @ApiBearerAuth()
  async requestPhoneVerification(
    @Request() req: RequestWithUser,
    @Body() dto: PhoneVerifyRequestDto,
  ): Promise<{ message: string }> {
    return this.authService.requestPhoneVerify(req.user.sub, dto.phone);
  }

  @ApiExcludeEndpoint()
  @Post('phone/verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify phone number' })
  @ApiBody({ type: VerifyPhoneDto })
  @ApiOkResponse({ description: 'Phone number verified successfully' })
  @ApiBadRequestResponse({ description: 'Invalid verification code' })
  async verifyPhone(@Body() dto: VerifyPhoneDto): Promise<{ message: string }> {
    return await this.authService.verifyPhone(dto);
  }

  @ApiExcludeEndpoint()
  @Post('phone/password/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset via phone' })
  @ApiBody({ type: RequestPhonePasswordResetDto })
  @ApiOkResponse({ description: 'Reset code sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid phone number' })
  async requestPhonePasswordReset(
    @Body() dto: RequestPhonePasswordResetDto,
  ): Promise<{ message: string }> {
    return await this.authService.requestPhonePasswordReset(dto);
  }
  @ApiExcludeEndpoint()
  @Post('phone/password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using phone and reset code' })
  @ApiBody({ type: ResetPhonePasswordDto })
  @ApiOkResponse({ description: 'Password reset successful' })
  @ApiBadRequestResponse({ description: 'Invalid or expired reset code' })
  async resetPhonePassword(
    @Body() dto: ResetPhonePasswordDto,
  ): Promise<{ message: string }> {
    return await this.authService.phonePasswordReset(dto);
  }

  /////////////////////////////////////////////////////////////////
}
