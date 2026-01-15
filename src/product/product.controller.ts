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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/product-create.dto';
import { UpdateProductDto } from './dto/product-update.dto';
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
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with filters and pagination' })
  @ApiOkResponse({
    description: 'List of products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductResponseDto' },
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
  findAll(@Query() query?: ProductQueryDto) {
    return this.productService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiOkResponse({
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or duplicate slug/SKU',
  })
  @ApiNotFoundResponse({
    description: 'Category or brand not found',
  })
  create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.create(createProductDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() query?: ProductQueryDto,
  ): Promise<ProductResponseDto> {
    return this.productService.findOne(id, query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or duplicate slug/SKU',
  })
  @ApiNotFoundResponse({
    description: 'Product, category, or brand not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (soft delete)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Product deleted successfully',
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
    description: 'Cannot delete product with cart items or order history',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.productService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore deleted product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product restored successfully',
    type: ProductResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have sufficient permissions',
  })
  @ApiBadRequestResponse({
    description: 'Product is not deleted',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  restore(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto> {
    return this.productService.restore(id);
  }
}

