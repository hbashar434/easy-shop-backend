import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, UserFiltersDto } from './dto/user.dto';
import { Role, Status } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: UserFiltersDto & { requesterRole: Role }) {
    const {
      search,
      role,
      status,
      isEmailVerified,
      isPhoneVerified,
      isProfileComplete,
      startDate,
      endDate,
      requesterRole,
    } = filters;

    // Build where clause
    const where = {
      deletedAt: null,
      // Non-admin users can only see USER role accounts
      ...(requesterRole !== Role.ADMIN && {
        role: Role.USER,
      }),
      // Apply role filter for admins
      ...(requesterRole === Role.ADMIN &&
        role && {
          role,
        }),
      // Status filter
      ...(status && { status }),
      // Email verification filter
      ...(isEmailVerified !== undefined && {
        isEmailVerified,
      }),
      // Phone verification filter
      ...(isPhoneVerified !== undefined && {
        isPhoneVerified,
      }),
      // Profile completion filter
      ...(isProfileComplete !== undefined && {
        isProfileComplete,
      }),
      // Date range filter
      ...(startDate && {
        createdAt: {
          gte: startDate,
          ...(endDate && { lte: endDate }),
        },
      }),
      // Search filter
      ...(search && {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ],
      }),
    };

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        status: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isProfileComplete: true,
        verificationToken: true,
        verificationExpires: true,
        refreshToken: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        status: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isProfileComplete: true,
        verificationToken: true,
        verificationExpires: true,
        refreshToken: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Prevent changing admin role unless you're an admin
    if (
      user.role === Role.ADMIN &&
      updateUserDto.role &&
      updateUserDto.role !== Role.ADMIN
    ) {
      throw new Error('Cannot modify admin role');
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        status: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isProfileComplete: true,
        verificationToken: true,
        verificationExpires: true,
        refreshToken: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.role === Role.ADMIN) {
      throw new Error('Cannot delete admin user');
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: Status.INACTIVE,
      },
    });

    return { message: 'User deleted successfully' };
  }

  async restore(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: { not: null } },
    });

    if (!user) {
      throw new NotFoundException(`Deleted user with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: null,
        status: Status.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        status: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isProfileComplete: true,
        verificationToken: true,
        verificationExpires: true,
        refreshToken: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
  }
}
