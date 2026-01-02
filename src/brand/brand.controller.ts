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
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/brand-create.dto';
import { UpdateBrandDto } from './dto/brand-update.dto';
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
import { BrandResponseDto } from './dto/brand-response.dto';
import { BrandQueryDto } from './dto/brand-query.dto';

@ApiTags('Brands')
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @ApiOperation({ summary: 'Get all brands with filters and pagination' })
  @ApiOkResponse({
    description: 'List of brands retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/BrandResponseDto' },
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
  findAll(@Query() query?: BrandQueryDto) {
    return this.brandService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiOkResponse({
    description: 'Brand created successfully',
    type: BrandResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or duplicate slug/name',
  })
  create(
    @Body() createBrandDto: CreateBrandDto,
  ): Promise<BrandResponseDto> {
    return this.brandService.create(createBrandDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand by id' })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  @ApiOkResponse({
    description: 'Brand retrieved successfully',
    type: BrandResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Brand not found',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() query?: BrandQueryDto,
  ): Promise<BrandResponseDto> {
    return this.brandService.findOne(id, query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update brand' })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  @ApiOkResponse({
    description: 'Brand updated successfully',
    type: BrandResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or duplicate slug/name',
  })
  @ApiNotFoundResponse({
    description: 'Brand not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateBrandDto,
  ): Promise<BrandResponseDto> {
    return this.brandService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete brand (soft delete)' })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  @ApiOkResponse({
    description: 'Brand deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Brand deleted successfully',
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
    description: 'Cannot delete brand with products',
  })
  @ApiNotFoundResponse({
    description: 'Brand not found',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.brandService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore deleted brand' })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  @ApiOkResponse({
    description: 'Brand restored successfully',
    type: BrandResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiBadRequestResponse({
    description: 'Brand is not deleted',
  })
  @ApiNotFoundResponse({
    description: 'Brand not found',
  })
  restore(@Param('id', ParseIntPipe) id: number): Promise<BrandResponseDto> {
    return this.brandService.restore(id);
  }
}

