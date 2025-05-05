import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserResponseDto,
  UserListResponseDto,
  DeleteUserResponseDto,
} from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private excludeSensitiveFields(user: User): UserResponseDto {
    const {
      password,
      verificationToken,
      verificationExpires,
      refreshToken,
      ...result
    } = user;
    return result as UserResponseDto;
  }

  async findAll(includeDeleted = false): Promise<UserListResponseDto> {
    const where = includeDeleted ? {} : { deletedAt: null };
    const users = await this.prisma.user.findMany({ where });
    return {
      users: users.map((user) => this.excludeSensitiveFields(user)),
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.excludeSensitiveFields(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser || existingUser.deletedAt) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check email uniqueness if being updated
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }

    // Check phone uniqueness if being updated
    if (updateUserDto.phone && updateUserDto.phone !== existingUser.phone) {
      const phoneExists = await this.prisma.user.findUnique({
        where: { phone: updateUserDto.phone },
      });
      if (phoneExists) {
        throw new ConflictException('Phone number already in use');
      }
    }

    // Hash password if provided
    const dataToUpdate: Prisma.UserUpdateInput = { ...updateUserDto };
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Reset verification status if email/phone is changed
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      dataToUpdate.isEmailVerified = false;
      dataToUpdate.verificationToken = null;
      dataToUpdate.verificationExpires = null;
    }
    if (updateUserDto.phone && updateUserDto.phone !== existingUser.phone) {
      dataToUpdate.isPhoneVerified = false;
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: dataToUpdate,
      });
      return this.excludeSensitiveFields(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Unique constraint violation');
        }
      }
      throw error;
    }
  }

  async remove(id: string, hardDelete = false): Promise<DeleteUserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || (!hardDelete && user.deletedAt)) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (hardDelete) {
      await this.prisma.user.delete({
        where: { id },
      });
    } else {
      await this.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }

    return { message: 'User deleted successfully' };
  }

  async restore(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!user.deletedAt) {
      throw new BadRequestException('User is not deleted');
    }

    const restoredUser = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });

    return this.excludeSensitiveFields(restoredUser);
  }
}
