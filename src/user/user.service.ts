import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/user-update.dto';
import { Prisma, Role, Status } from '@prisma/client';
import { sanitizeQuery } from 'src/common/sanitizers/query-sanitizers';
import { UserQueryDto } from './dto/user-query.dto';
import { AuthRequest } from 'src/common/interfaces/request.interface';
import { buildUserSelectQuery } from './queries/user.query-builder';
import {
  USER_DEFAULT_SELECT,
  ALLOWED_USER_FIELDS,
} from './queries/user.default-query';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: UserQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_USER_FIELDS,
    );

    const select: Prisma.UserSelect = buildUserSelectQuery(sanitizedFields);

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (query?.role) {
      where.role = query.role;
    }

    if (query?.status) {
      where.status = query.status;
    }

    const page: number = query?.page ?? 1;
    const limit: number = query?.limit ?? 10;
    const skip: number = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, query?: UserQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_USER_FIELDS,
    );

    const select: Prisma.UserSelect = buildUserSelectQuery(sanitizedFields);

    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select,
    });

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

    if (
      user.role === Role.ADMIN &&
      (updateUserDto.role || updateUserDto.status)
    ) {
      throw new Error('Cannot modify admin role or status');
    }

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
      select: USER_DEFAULT_SELECT,
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
      select: USER_DEFAULT_SELECT,
    });
  }
}
