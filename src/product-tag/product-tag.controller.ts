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
import { ProductTagService } from './product-tag.service';
import { CreateProductTagDto } from './dto/product-tag-create.dto';
import { UpdateProductTagDto } from './dto/product-tag-update.dto';
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
import { ProductTagResponseDto } from './dto/product-tag-response.dto';
import { ProductTagQueryDto } from './dto/product-tag-query.dto';

@ApiTags('Product Tags')
@Controller('product-tags')
export class ProductTagController {
  constructor(private readonly productTagService: ProductTagService) {}

  @Get()
  @ApiOperation({ summary: 'Get all product tags with filters and pagination' })
  @ApiOkResponse({
    description: 'List of product tags retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductTagResponseDto' },
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
  findAll(@Query() query?: ProductTagQueryDto) {
    return this.productTagService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product tag' })
  @ApiOkResponse({
    description: 'Product tag created successfully',
    type: ProductTagResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or duplicate tag name',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  create(
    @Body() createProductTagDto: CreateProductTagDto,
  ): Promise<ProductTagResponseDto> {
    return this.productTagService.create(createProductTagDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product tag by id' })
  @ApiParam({ name: 'id', description: 'Product Tag ID' })
  @ApiOkResponse({
    description: 'Product tag retrieved successfully',
    type: ProductTagResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Product tag not found',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() query?: ProductTagQueryDto,
  ): Promise<ProductTagResponseDto> {
    return this.productTagService.findOne(id, query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product tag' })
  @ApiParam({ name: 'id', description: 'Product Tag ID' })
  @ApiOkResponse({
    description: 'Product tag updated successfully',
    type: ProductTagResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or duplicate tag name',
  })
  @ApiNotFoundResponse({
    description: 'Product tag or product not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductTagDto: UpdateProductTagDto,
  ): Promise<ProductTagResponseDto> {
    return this.productTagService.update(id, updateProductTagDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product tag' })
  @ApiParam({ name: 'id', description: 'Product Tag ID' })
  @ApiOkResponse({
    description: 'Product tag deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Product tag deleted successfully',
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
  @ApiNotFoundResponse({
    description: 'Product tag not found',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.productTagService.remove(id);
  }
}

