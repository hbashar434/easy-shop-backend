import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
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
import { AuthResponseDto } from './dto/auth-response.dto';
import { MailService } from '../common/mail/mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getVerificationExpiry(): Date {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  }

  private async sendLoginVerificationCode(user: any): Promise<void> {
    const verificationCode = this.generateVerificationCode();
    const verificationExpires = this.getVerificationExpiry();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: verificationCode,
        verificationExpires,
      },
    });

    if (user.email) {
      await this.mailService.sendMails({
        to: user.email,
        subject: 'Login Verification Code',
        template: 'verification-code',
        context: {
          name: user.firstName || 'User',
          verificationCode,
          expiresIn: 10,
        },
      });
    } else if (user.phone) {
      // TODO: Implement SMS service integration
      console.log(
        `SMS login verification code for ${user.phone}: ${verificationCode}`,
      );
    }
  }

  private createUserResponse(user: any): AuthResponseDto {
    const {
      password,
      verificationToken,
      verificationExpires,
      resetPasswordToken,
      resetPasswordExpires,
      ...userWithoutSensitive
    } = user;

    return {
      accessToken: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      }),
      user: {
        ...userWithoutSensitive,
        isProfileComplete: user.isProfileComplete,
      },
    };
  }

  async initiateEmailRegister(
    dto: InitiateEmailRegisterDto,
  ): Promise<{ message: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        throw new ConflictException('Email is already registered and verified');
      }

      // User exists but not verified, send new verification code
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
        subject: 'Complete Your Registration',
        template: 'verification-code',
        context: {
          name: existingUser.firstName || 'User',
          verificationCode,
          expiresIn: 10,
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
      },
    });

    await this.mailService.sendMails({
      to: dto.email,
      subject: 'Complete Your Registration',
      template: 'verification-code',
      context: {
        name: 'User',
        verificationCode,
        expiresIn: 10,
      },
    });

    return { message: 'Verification code sent successfully' };
  }

  async completeEmailRegister(
    dto: CompleteEmailRegisterDto,
  ): Promise<AuthResponseDto> {
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
      },
    });

    return this.createUserResponse(updatedUser);
  }

  async initiatePhoneRegister(
    dto: InitiatePhoneRegisterDto,
  ): Promise<{ message: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existingUser) {
      if (existingUser.isPhoneVerified) {
        throw new ConflictException(
          'Phone number is already registered and verified',
        );
      }

      // User exists but not verified, send new verification code
      const verificationCode = this.generateVerificationCode();
      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          verificationToken: verificationCode,
          verificationExpires: this.getVerificationExpiry(),
        },
      });

      // TODO: Implement SMS service integration
      console.log(
        `SMS verification code for ${dto.phone}: ${verificationCode}`,
      );

      return { message: 'New verification code sent successfully' };
    }

    // New user registration
    const verificationCode = this.generateVerificationCode();
    await this.prisma.user.create({
      data: {
        phone: dto.phone,
        verificationToken: verificationCode,
        verificationExpires: this.getVerificationExpiry(),
        password: '', // Required by Prisma schema
      },
    });

    // TODO: Implement SMS service integration
    console.log(`SMS verification code for ${dto.phone}: ${verificationCode}`);

    return { message: 'Verification code sent successfully' };
  }

  async completePhoneRegister(
    dto: CompletePhoneRegisterDto,
  ): Promise<AuthResponseDto> {
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
      },
    });

    return this.createUserResponse(updatedUser);
  }

  async loginWithPassword(
    identifier: string,
    password: string | undefined,
  ): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!password) {
      throw new BadRequestException('Password is required');
    }

    if (!user.password) {
      throw new BadRequestException(
        'Password not set for this account. Please use OTP login',
      );
    }

    // Check if the identifier used for login is verified
    const isEmailLogin = identifier.includes('@');
    const isIdentifierVerified = isEmailLogin
      ? user.isEmailVerified
      : user.isPhoneVerified;

    if (!isIdentifierVerified) {
      const alternativeIdentifier = isEmailLogin
        ? user.isPhoneVerified
          ? user.phone
          : null
        : user.isEmailVerified
          ? user.email
          : null;

      if (alternativeIdentifier) {
        throw new BadRequestException(
          `This ${
            isEmailLogin ? 'email' : 'phone number'
          } is not verified. Please login with your verified ${
            isEmailLogin ? 'phone number' : 'email'
          }: ${alternativeIdentifier}`,
        );
      } else {
        throw new BadRequestException(
          `This ${
            isEmailLogin ? 'email' : 'phone number'
          } is not verified. Please verify it first.`,
        );
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return this.createUserResponse(user);
  }

  async loginWithOTP(
    identifier: string,
    verificationCode?: string,
  ): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if the identifier is verified
    const isEmailLogin = identifier.includes('@');
    const isIdentifierVerified = isEmailLogin
      ? user.isEmailVerified
      : user.isPhoneVerified;

    if (!isIdentifierVerified) {
      throw new BadRequestException(
        `This ${isEmailLogin ? 'email' : 'phone number'} is not verified.`,
      );
    }

    // If no verification code provided, send one
    if (!verificationCode) {
      await this.sendLoginVerificationCode(user);
      throw new BadRequestException({
        message: 'Verification code sent to your email/phone',
        requiresVerification: true,
      });
    }

    // Verify the code
    if (
      !user.verificationToken ||
      user.verificationToken !== verificationCode ||
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

  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const resetCode = this.generateVerificationCode();
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetCode,
        resetPasswordExpires: this.getVerificationExpiry(),
      },
    });

    if (user.email) {
      await this.mailService.sendMails({
        to: user.email,
        subject: 'Password Reset Request',
        template: 'reset-password',
        context: {
          name: user.firstName || 'User',
          resetToken: resetCode,
        },
      });
    }
    // SMS implementation for phone reset will be added later
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
        resetPasswordToken: dto.code,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid reset code');
    }

    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('Reset code expired');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
  }
}
