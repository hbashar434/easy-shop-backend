import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/user-update.dto';
import { Role, Status } from '@prisma/client';
import {
  sanitizeQuery,
  sanitizeQueryForUnique,
} from 'src/common/sanitizers/query-sanitizers';
import {
  allowedFieldsForUser,
  allowedRelationsForUser,
  defaultSelectForUser,
  defaultWhereForUser,
  allowedRelationFieldsForUser,
  defaultIncludeForUser,
} from 'src/constants/user.constants';
import { UserQueryDto } from './dto/user-query.dto';
import { AuthRequest } from 'src/common/interfaces/request.interface';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: UserQueryDto) {
    const queryOptions = sanitizeQuery(
      query,
      allowedFieldsForUser,
      allowedRelationsForUser,
      allowedRelationFieldsForUser,
      defaultWhereForUser,
      defaultSelectForUser,
      defaultIncludeForUser,
    );

    return this.prisma.user.findMany(queryOptions);
  }

  async findOne(id: string, query?: UserQueryDto) {
    const queryOptions = sanitizeQueryForUnique(
      query,
      allowedFieldsForUser,
      allowedRelationsForUser,
      allowedRelationFieldsForUser,
      { id },
      defaultSelectForUser,
      {},
    );

    const user = await this.prisma.user.findUnique(queryOptions);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, req: AuthRequest) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Never allow changing admin's role or status
    if (
      user.role === Role.ADMIN &&
      (updateUserDto.role || updateUserDto.status)
    ) {
      throw new Error('Cannot modify admin role or status');
    }

    // Only allow admin and manager to update role and status for non-admin users
    if (
      (updateUserDto.role || updateUserDto.status) &&
      (req.user.role as Role) !== Role.ADMIN &&
      (req.user.role as Role) !== Role.MANAGER
    ) {
      throw new Error('Only admin and manager can modify role and status');
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: defaultSelectForUser,
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
      select: defaultSelectForUser,
    });
  }
}
