import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
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

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const verificationCode = this.generateVerificationCode();

    const user = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: hashedPassword,
        verificationToken: verificationCode,
        verificationExpires: this.getVerificationExpiry(),
      },
    });

    if (!user.email) {
      throw new BadRequestException('Email is required for registration');
    }

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Welcome to MyShop - Verify Your Email',
      template: 'verification-code',
      context: {
        name: user.firstName || 'User',
        verificationCode,
        expiresIn: 10,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const {
      password,
      verificationToken,
      verificationExpires,
      resetPasswordToken,
      resetPasswordExpires,
      ...userWithoutSensitive
    } = user;

    return {
      accessToken: this.jwtService.sign(payload),
      user: userWithoutSensitive,
    };
  }

  async registerWithPhone(
    phoneRegisterDto: PhoneRegisterDto,
  ): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: phoneRegisterDto.phone },
    });

    if (existingUser) {
      throw new ConflictException('Phone number already registered');
    }

    const hashedPassword = await bcrypt.hash(phoneRegisterDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...phoneRegisterDto,
        password: hashedPassword,
      },
    });

    // SMS verification will be implemented later
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const {
      password,
      verificationToken,
      verificationExpires,
      resetPasswordToken,
      resetPasswordExpires,
      ...userWithoutSensitive
    } = user;

    return {
      accessToken: this.jwtService.sign(payload),
      user: userWithoutSensitive,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: loginDto.email }, { phone: loginDto.email }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const {
      password,
      verificationToken,
      verificationExpires,
      resetPasswordToken,
      resetPasswordExpires,
      ...userWithoutSensitive
    } = user;
    return {
      accessToken: this.jwtService.sign(payload),
      user: userWithoutSensitive,
    };
  }

  async requestEmailVerification(
    dto: RequestEmailVerificationDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (!user.email) {
      throw new BadRequestException('User does not have an email address');
    }

    const verificationCode = this.generateVerificationCode();
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: verificationCode,
        verificationExpires: this.getVerificationExpiry(),
      },
    });

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Email Verification Code',
      template: 'verification-code',
      context: {
        name: user.firstName || 'User',
        verificationCode,
        expiresIn: 10,
      },
    });
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (!user.verificationToken || !user.verificationExpires) {
      throw new BadRequestException('No verification code found');
    }

    if (user.verificationToken !== dto.code) {
      throw new BadRequestException('Invalid verification code');
    }

    if (new Date() > user.verificationExpires) {
      throw new BadRequestException('Verification code expired');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });
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
      await this.mailService.sendMail({
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
