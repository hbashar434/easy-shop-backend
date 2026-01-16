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
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/cart-create.dto';
import { UpdateCartItemDto } from './dto/cart-update.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CartItemResponseDto } from './dto/cart-response.dto';
import { CartQueryDto } from './dto/cart-query.dto';
import { AuthRequest } from '../common/interfaces/request.interface';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cart items for authenticated user' })
  @ApiOkResponse({
    description: 'List of cart items retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/CartItemResponseDto' },
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
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBadRequestResponse({ description: 'Invalid filter parameters' })
  findAll(@Request() req: AuthRequest, @Query() query?: CartQueryDto) {
    return this.cartService.findAll(req.user.sub, query);
  }

  @Post()
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiOkResponse({
    description: 'Item added to cart successfully',
    type: CartItemResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBadRequestResponse({
    description: 'Invalid input data, product not found, or insufficient stock',
  })
  create(
    @Body() createCartItemDto: CreateCartItemDto,
    @Request() req: AuthRequest,
  ): Promise<CartItemResponseDto> {
    return this.cartService.create(createCartItemDto, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cart item by id' })
  @ApiParam({ name: 'id', description: 'Cart Item ID' })
  @ApiOkResponse({
    description: 'Cart item retrieved successfully',
    type: CartItemResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBadRequestResponse({ description: 'Unauthorized access' })
  @ApiNotFoundResponse({ description: 'Cart item not found' })
  findOne(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Query() query?: CartQueryDto,
  ): Promise<CartItemResponseDto> {
    return this.cartService.findOne(id, req.user.sub, query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'id', description: 'Cart Item ID' })
  @ApiOkResponse({
    description: 'Cart item updated successfully',
    type: CartItemResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBadRequestResponse({
    description: 'Invalid input data, insufficient stock, or unauthorized',
  })
  @ApiNotFoundResponse({ description: 'Cart item not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Request() req: AuthRequest,
  ): Promise<CartItemResponseDto> {
    return this.cartService.update(id, req.user.sub, updateCartItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', description: 'Cart Item ID' })
  @ApiOkResponse({
    description: 'Cart item deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Cart item deleted successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBadRequestResponse({ description: 'Unauthorized to delete this item' })
  @ApiNotFoundResponse({ description: 'Cart item not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthRequest,
  ): Promise<{ message: string }> {
    return this.cartService.remove(id, req.user.sub);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiOkResponse({
    description: 'Cart cleared successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '5 items removed from cart',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  clearCart(@Request() req: AuthRequest): Promise<{ message: string }> {
    return this.cartService.clearCart(req.user.sub);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore deleted cart item' })
  @ApiParam({ name: 'id', description: 'Cart Item ID' })
  @ApiOkResponse({
    description: 'Cart item restored successfully',
    type: CartItemResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBadRequestResponse({ description: 'Unauthorized or item not deleted' })
  @ApiNotFoundResponse({ description: 'Cart item not found' })
  restore(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthRequest,
  ): Promise<CartItemResponseDto> {
    return this.cartService.restore(id, req.user.sub);
  }
}
