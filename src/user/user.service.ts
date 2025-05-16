import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/user-update.dto';
import { Role, Status } from '@prisma/client';
import { sanitizeQuery } from 'src/common/query/sanitizers';
import {
  allowedFields,
  allowedRelations,
  defaultSelect,
  defaultWhere,
  allowedRelationFields,
} from 'src/constants/user.constants';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: UserQueryDto) {
    const queryOptions = sanitizeQuery(
      query,
      defaultWhere,
      defaultSelect,
      allowedFields,
      allowedRelations,
      allowedRelationFields,
    );

    return this.prisma.user.findMany(queryOptions);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
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
