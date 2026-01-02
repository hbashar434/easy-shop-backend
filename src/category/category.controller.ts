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
  ParseIntPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/category-create.dto';
import { UpdateCategoryDto } from './dto/category-update.dto';
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
import { CategoryResponseDto } from './dto/category-response.dto';
import { CategoryQueryDto } from './dto/category-query.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories with filters and pagination' })
  @ApiOkResponse({
    description: 'List of categories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/CategoryResponseDto' },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid filter parameters' })
  findAll(@Query() query?: CategoryQueryDto) {
    return this.categoryService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiOkResponse({
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or duplicate slug',
  })
  @ApiNotFoundResponse({
    description: 'Parent category not found',
  })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.create(createCategoryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by id' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiOkResponse({
    description: 'Category retrieved successfully',
    type: CategoryResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() query?: CategoryQueryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.findOne(id, query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiOkResponse({
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data, circular reference, or duplicate slug',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category (soft delete)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiOkResponse({
    description: 'Category deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Category deleted successfully',
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
    description: 'Cannot delete category with subcategories or products',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.categoryService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore deleted category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiOkResponse({
    description: 'Category restored successfully',
    type: CategoryResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiBadRequestResponse({
    description: 'Category is not deleted',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  restore(@Param('id', ParseIntPipe) id: number): Promise<CategoryResponseDto> {
    return this.categoryService.restore(id);
  }
}
