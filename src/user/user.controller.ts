import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user-update.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiParam,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AuthRequest } from 'src/common/interfaces/request.interface';
import { UserResponseDto } from './dto/user-response.dto';
import { QueryPipe } from 'src/common/pipe/query.pipe';
import { UserQueryDto } from './dto/user-query.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get all users with filters' })
  @ApiOkResponse({
    description: 'List of users retrieved successfully',
    type: [UserResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiBadRequestResponse({ description: 'Invalid filter parameters' })
  findAll(@Query('query', QueryPipe) query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or cannot modify admin user',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN) // Only admin can delete users
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({
    description: 'User deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User deleted successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiBadRequestResponse({
    description: 'Cannot delete admin user',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.userService.remove(id);
  }

  @Post(':id/restore')
  @Roles(Role.ADMIN) // Only admin can restore users
  @ApiOperation({ summary: 'Restore deleted user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({
    description: 'User restored successfully',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiBadRequestResponse({
    description: 'User is not deleted',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  restore(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.restore(id);
  }
}
