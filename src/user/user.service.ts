import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role, Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/user.dto';
import { UserFilters } from './interfaces/user.interface';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: UserFilters): Promise<User[]> {
    const where: Prisma.UserWhereInput = {};

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search } },
        { phone: { contains: filters.search } },
        { firstName: { contains: filters.search } },
        { lastName: { contains: filters.search } },
      ];
    }

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.isEmailVerified !== undefined) {
      where.isEmailVerified = filters.isEmailVerified;
    }

    if (filters?.isPhoneVerified !== undefined) {
      where.isPhoneVerified = filters.isPhoneVerified;
    }

    if (filters?.isProfileComplete !== undefined) {
      where.isProfileComplete = filters.isProfileComplete;
    }

    // Handle date range filtering
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};

      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }

      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    // Exclude ADMIN users from results if requester is MANAGER
    if (filters?.requesterRole === Role.MANAGER) {
      where.role = { not: Role.ADMIN };
    }

    return this.prisma.user.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, requesterRole?: Role): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (requesterRole === Role.MANAGER && user.role === Role.ADMIN) {
      throw new ForbiddenException(
        'Insufficient permissions to view this user',
      );
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    requesterRole?: Role,
  ): Promise<User> {
    try {
      const existingUser = await this.findOne(id, requesterRole);

      if (requesterRole === Role.MANAGER && existingUser.role === Role.ADMIN) {
        throw new ForbiddenException('Cannot modify admin user');
      }

      if (requesterRole === Role.MANAGER && updateUserDto.role) {
        throw new ForbiddenException('Managers cannot change user roles');
      }

      if (
        updateUserDto.role &&
        updateUserDto.role !== existingUser.role &&
        existingUser.role === Role.ADMIN &&
        requesterRole !== Role.ADMIN
      ) {
        throw new BadRequestException(
          'Cannot change role of an existing admin user',
        );
      }

      if (updateUserDto.role === Role.ADMIN && requesterRole !== Role.ADMIN) {
        throw new ForbiddenException('Only admins can create other admins');
      }

      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  async remove(id: string, requesterRole?: Role): Promise<{ message: string }> {
    try {
      const user = await this.findOne(id, requesterRole);

      if (requesterRole !== Role.ADMIN) {
        throw new ForbiddenException('Only admins can delete users');
      }

      if (user.role === Role.ADMIN) {
        throw new BadRequestException('Cannot delete an admin user');
      }

      await this.prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      });

      return { message: 'User deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete user');
    }
  }

  async restore(id: string, requesterRole?: Role): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (requesterRole !== Role.ADMIN) {
        throw new ForbiddenException('Only admins can restore users');
      }

      if (!user.deletedAt) {
        throw new BadRequestException('User is not deleted');
      }

      return await this.prisma.user.update({
        where: { id },
        data: {
          isActive: true,
          deletedAt: null,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to restore user');
    }
  }
}
