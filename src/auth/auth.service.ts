import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import {
  EmailCodeDto,
  PhoneCodeDto,
  RegisterWithEmailDto,
  RegisterWithPhoneDto,
} from './dto/register.dto';
import {
  RequestEmailPasswordResetDto,
  ResetEmailPasswordDto,
  RequestPhonePasswordResetDto,
  ResetPhonePasswordDto,
} from './dto/reset-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { MailService } from '../common/mail/mail.service';
import { SmsService } from '../common/sms/sms.service';
import * as bcrypt from 'bcrypt';
import { User, Role, Status } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { SafeUser } from './interfaces/auth.interface';
import {
  EmailOtpLoginDto,
  EmailPasswordLoginDto,
  PhoneOtpLoginDto,
  PhonePasswordLoginDto,
} from './dto/login.dto';
import { VerifyEmailDto, VerifyPhoneDto } from './dto/verify.dto';
import { JwtPayload } from 'src/common/interfaces/request.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private smsService: SmsService,
    private configService: ConfigService,
  ) {}

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getVerificationExpiry(): Date {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  }

  private generateTokens(user: User) {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email ?? '',
      role: user.role,
    };

    const refreshPayload: Pick<JwtPayload, 'sub'> = {
      sub: user.id,
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '3d'),
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
        '15d',
      ),
    });

    return { accessToken, refreshToken };
  }

  private async updateUserTokens(userId: string, refreshToken: string | null) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken,
        lastLogin: new Date(),
        ...(user?.password && { isProfileComplete: true }),
        ...(user?.status === Status.INACTIVE && { status: Status.ACTIVE }),
      },
    });
  }

  private createUserResponse(user: User): AuthResponseDto {
    const {
      password,
      verificationToken,
      verificationExpires,
      refreshToken,
      ...userWithoutSensitive
    } = user;

    const tokens = this.generateTokens(user);

    // Update user with refresh token and lastLogin
    void this.updateUserTokens(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userWithoutSensitive,
    };
  }

  async sendEmailCode(dto: EmailCodeDto): Promise<{ message: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found. Please create an account.');
    }

    const verificationCode = this.generateVerificationCode();
    await this.prisma.user.update({
      where: { id: existingUser.id },
      data: {
        verificationToken: verificationCode,
        verificationExpires: this.getVerificationExpiry(),
      },
    });

    await this.mailService.sendMails({
      to: dto.email,
      subject: 'Verify Yourself',
      template: 'verification-code',
      context: {
        name: existingUser.firstName || 'User',
        verificationCode,
        expiresIn: 2,
      },
    });

    return { message: 'Verification code sent successfully' };
  }

  async requestRegisterWithEmail(
    dto: EmailCodeDto,
  ): Promise<{ message: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        throw new ConflictException(
          'Email already exists and is verified. Please log in.',
        );
      }

      const verificationCode = this.generateVerificationCode();
      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          verificationToken: verificationCode,
          verificationExpires: this.getVerificationExpiry(),
        },
      });

      await this.mailService.sendMails({
        to: dto.email,
        subject: 'Verify Yourself',
        template: 'verification-code',
        context: {
          name: existingUser.firstName || 'User',
          verificationCode,
          expiresIn: 2,
        },
      });

      return { message: 'New verification code sent successfully' };
    }

    // New user registration
    const verificationCode = this.generateVerificationCode();
    await this.prisma.user.create({
      data: {
        email: dto.email,
        verificationToken: verificationCode,
        verificationExpires: this.getVerificationExpiry(),
        password: '', // Required by Prisma schema
        status: Status.ACTIVE, // Set default status
      },
    });

    await this.mailService.sendMails({
      to: dto.email,
      subject: 'Verify Yourself',
      template: 'verification-code',
      context: {
        name: 'User',
        verificationCode,
        expiresIn: 2,
      },
    });

    return { message: 'Verification code sent successfully' };
  }

  async registerWithEmail(dto: RegisterWithEmailDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
        verificationToken: dto.code,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification code');
    }

    if (!user.verificationExpires || new Date() > user.verificationExpires) {
      throw new BadRequestException('Verification code expired');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationExpires: null,
        lastLogin: new Date(),
      },
    });

    return this.createUserResponse(updatedUser);
  }

  async loginWithEmailPassword(
    dto: EmailPasswordLoginDto,
  ): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      if (user.isPhoneVerified) {
        throw new BadRequestException(
          `Email is not verified. Please login with your verified phone number: ${user.phone}`,
        );
      }
      throw new BadRequestException(
        'Email is not verified. Please verify it first.',
      );
    }

    if (!dto.password) {
      throw new BadRequestException('Password is required');
    }

    if (!user.password) {
      throw new BadRequestException(
        'Password not set for this account. Please use OTP login',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return this.createUserResponse(user);
  }

  async loginWithEmailOtp(dto: EmailOtpLoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new BadRequestException('Email is not verified');
    }

    if (!dto.code) {
      throw new BadRequestException('Verification code is required');
    }

    // Verify the code
    if (
      !user.verificationToken ||
      user.verificationToken !== dto.code ||
      !user.verificationExpires ||
      new Date() > user.verificationExpires
    ) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    // Clear verification data
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: null,
        verificationExpires: null,
        lastLogin: new Date(),
      },
    });

    return this.createUserResponse(user);
  }

  async requestEmailPasswordReset(
    dto: RequestEmailPasswordResetDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('No account found with this email');
    }

    if (!user.isEmailVerified) {
      throw new BadRequestException('Email is not verified');
    }

    const verificationCode = this.generateVerificationCode();
    const verificationExpiry = this.getVerificationExpiry();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: verificationCode,
        verificationExpires: verificationExpiry,
      },
    });

    await this.mailService.sendMails({
      to: dto.email,
      subject: 'Password Reset Request',
      template: 'reset-password',
      context: {
        name: user.firstName || 'User',
        resetToken: verificationCode,
      },
    });

    return { message: 'Reset code sent successfully to your email' };
  }

  async emailPasswordReset(
    dto: ResetEmailPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
        verificationToken: dto.code,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid reset code');
    }

    if (!user.verificationExpires || new Date() > user.verificationExpires) {
      throw new BadRequestException('Reset code has expired');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationToken: null,
        verificationExpires: null,
        isProfileComplete: true,
      },
    });

    return { message: 'Password reset successful' };
  }

  async requestEmailVerify(
    userId: string,
    email: string,
  ): Promise<{ message: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Email already in use by another account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const verificationCode = this.generateVerificationCode();
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email,
        isEmailVerified: false,
        verificationToken: verificationCode,
        verificationExpires: this.getVerificationExpiry(),
      },
    });

    await this.mailService.sendMails({
      to: email,
      subject: 'Verify Your Email',
      template: 'verification-code',
      context: {
        name: user.firstName || 'User',
        verificationCode,
        expiresIn: 10,
      },
    });

    return { message: 'Verification code sent to your email' };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        verificationToken: dto.code,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification code');
    }

    if (!user.verificationExpires || new Date() > user.verificationExpires) {
      throw new BadRequestException('Verification code has expired');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async sendPhoneCode(dto: PhoneCodeDto): Promise<{ message: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found. Please create an account.');
    }

    const verificationCode = this.generateVerificationCode();
    await this.prisma.user.update({
      where: { id: existingUser.id },
      data: {
        verificationToken: verificationCode,
        verificationExpires: this.getVerificationExpiry(),
      },
    });

    await this.smsService.sendMessages({
      to: dto.phone,
      template: 'verification-code',
      context: {
        name: existingUser.firstName || 'User',
        code: verificationCode,
        expiresIn: 2,
      },
    });

    return { message: 'Verification code sent successfully' };
  }

  async requestRegisterWithPhone(
    dto: PhoneCodeDto,
  ): Promise<{ message: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existingUser) {
      if (existingUser.isPhoneVerified) {
        throw new ConflictException(
          'Phone number already exists and is verified. Please log in.',
        );
      }

      const verificationCode = this.generateVerificationCode();
      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          verificationToken: verificationCode,
          verificationExpires: this.getVerificationExpiry(),
        },
      });

      await this.smsService.sendMessages({
        to: dto.phone,
        template: 'verification-code',
        context: {
          name: existingUser.firstName || 'User',
          code: verificationCode,
          expiresIn: 2,
        },
      });

      return { message: 'Verification code sent successfully' };
    }

    // New user registration
    const verificationCode = this.generateVerificationCode();
    await this.prisma.user.create({
      data: {
        phone: dto.phone,
        verificationToken: verificationCode,
        verificationExpires: this.getVerificationExpiry(),
        password: '', // Required by Prisma schema
        status: Status.ACTIVE, // Set default status
      },
    });

    await this.smsService.sendMessages({
      to: dto.phone,
      template: 'verification-code',
      context: {
        name: 'User',
        code: verificationCode,
        expiresIn: 2,
      },
    });

    return { message: 'Verification code sent successfully' };
  }

  async registerWithPhone(dto: RegisterWithPhoneDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        phone: dto.phone,
        verificationToken: dto.code,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification code');
    }

    if (!user.verificationExpires || new Date() > user.verificationExpires) {
      throw new BadRequestException('Verification code expired');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isPhoneVerified: true,
        verificationToken: null,
        verificationExpires: null,
        lastLogin: new Date(),
      },
    });

    return this.createUserResponse(updatedUser);
  }

  async loginWithPhonePassword(
    dto: PhonePasswordLoginDto,
  ): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isPhoneVerified) {
      if (user.isEmailVerified) {
        throw new BadRequestException(
          `Phone is not verified. Please login with your verified email: ${user.email}`,
        );
      }
      throw new BadRequestException(
        'Phone is not verified. Please verify it first.',
      );
    }

    if (!dto.password) {
      throw new BadRequestException('Password is required');
    }

    if (!user.password) {
      throw new BadRequestException(
        'Password not set for this account. Please use OTP login',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return this.createUserResponse(user);
  }

  async loginWithPhoneOtp(dto: PhoneOtpLoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isPhoneVerified) {
      throw new BadRequestException('Phone number is not verified');
    }

    if (!dto.code) {
      // Generate and send new OTP
      const verificationCode = this.generateVerificationCode();
      const verificationExpires = this.getVerificationExpiry();

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken: verificationCode,
          verificationExpires,
        },
      });

      await this.smsService.sendMessages({
        to: dto.phone,
        template: 'verification-code',
        context: {
          name: user.firstName || 'User',
          code: verificationCode,
          expiresIn: 2,
        },
      });

      const {
        password,
        verificationToken,
        verificationExpires: expires,
        refreshToken,
        ...userWithoutSensitive
      } = user;

      return {
        accessToken: '',
        refreshToken: '',
        user: userWithoutSensitive,
      };
    }

    // Verify the code
    if (
      !user.verificationToken ||
      user.verificationToken !== dto.code ||
      !user.verificationExpires ||
      new Date() > user.verificationExpires
    ) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    // Clear verification data
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: null,
        verificationExpires: null,
        lastLogin: new Date(),
      },
    });

    return this.createUserResponse(user);
  }

  async requestPhonePasswordReset(
    dto: RequestPhonePasswordResetDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new BadRequestException('No account found with this phone number');
    }

    if (!user.isPhoneVerified) {
      throw new BadRequestException('Phone number is not verified');
    }

    const verificationCode = this.generateVerificationCode();
    const verificationExpiry = this.getVerificationExpiry();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: verificationCode,
        verificationExpires: verificationExpiry,
      },
    });

    await this.smsService.sendMessages({
      to: dto.phone,
      template: 'reset-password',
      context: {
        name: user.firstName || 'User',
        code: verificationCode,
        expiresIn: 2,
      },
    });

    return { message: 'Reset code sent successfully to your phone' };
  }

  async phonePasswordReset(
    dto: ResetPhonePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: {
        phone: dto.phone,
        verificationToken: dto.code,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid reset code');
    }

    if (!user.verificationExpires || new Date() > user.verificationExpires) {
      throw new BadRequestException('Reset code has expired');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationToken: null,
        verificationExpires: null,
        isProfileComplete: true,
      },
    });

    return { message: 'Password reset successful' };
  }

  async requestPhoneVerify(
    userId: string,
    phone: string,
  ): Promise<{ message: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException(
        'Phone number already in use by another account',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const verificationCode = this.generateVerificationCode();
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        phone,
        isPhoneVerified: false,
        verificationToken: verificationCode,
        verificationExpires: this.getVerificationExpiry(),
      },
    });

    await this.smsService.sendMessages({
      to: phone,
      template: 'verification-code',
      context: {
        name: user.firstName || 'User',
        code: verificationCode,
        expiresIn: 10,
      },
    });

    return { message: 'Verification code sent to your phone' };
  }

  async verifyPhone(dto: VerifyPhoneDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        phone: dto.phone,
        verificationToken: dto.code,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification code');
    }

    if (!user.verificationExpires || new Date() > user.verificationExpires) {
      throw new BadRequestException('Verification code has expired');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isPhoneVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });

    return { message: 'Phone number verified successfully' };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      // Verify the refresh token with proper type
      const payload = this.jwtService.verify<Pick<JwtPayload, 'sub'>>(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );

      if (!payload?.sub) {
        throw new UnauthorizedException('Invalid refresh token payload');
      }

      // Find user with this refresh token
      const user = await this.prisma.user.findFirst({
        where: {
          id: payload.sub,
          refreshToken: refreshToken,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.createUserResponse(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
      },
    });

    return { message: 'Logged out successfully' };
  }

  async getCurrentUser(userId: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const {
      password,
      verificationToken,
      verificationExpires,
      refreshToken,
      ...userWithoutSensitive
    } = user;
    return userWithoutSensitive;
  }
}
