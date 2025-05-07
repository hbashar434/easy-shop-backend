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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, UserFiltersDto } from './dto/users.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UserResponseDto } from './dto/user-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get all users with filters' })
  @ApiOkResponse({
    description: 'List of users retrieved successfully',
    type: [UserResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiBadRequestResponse({
    description: 'Invalid filter parameters',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name, email or phone',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: Role,
    description: 'Filter by role',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'isEmailVerified',
    required: false,
    type: Boolean,
    description: 'Filter by email verification status',
  })
  @ApiQuery({
    name: 'isPhoneVerified',
    required: false,
    type: Boolean,
    description: 'Filter by phone verification status',
  })
  @ApiQuery({
    name: 'isProfileComplete',
    required: false,
    type: Boolean,
    description: 'Filter by profile completion status',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Filter by start date',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'Filter by end date',
  })
  findAll(@Query() filters: UserFiltersDto): Promise<UserResponseDto[]> {
    return this.usersService.findAll(filters);
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
    return this.usersService.findOne(id);
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
    return this.usersService.update(id, updateUserDto);
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
    return this.usersService.remove(id);
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
    return this.usersService.restore(id);
  }
}
