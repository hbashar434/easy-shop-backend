import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartItemDto } from './dto/cart-create.dto';
import { UpdateCartItemDto } from './dto/cart-update.dto';
import { Prisma } from '@prisma/client';
import { sanitizeQuery } from 'src/common/sanitizers/query-sanitizers';
import { CartQueryDto } from './dto/cart-query.dto';
import { buildCartSelectQuery } from './queries/cart.query-builder';
import {
  CART_DEFAULT_SELECT,
  ALLOWED_CART_FIELDS,
} from './queries/cart.default-query';
import { CartItemResponseDto } from './dto/cart-response.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private transformCartItem(item: any): CartItemResponseDto {
    if (item.product && item.product.price) {
      item.product.price = item.product.price.toString();
    }
    return item;
  }

  private transformCartItems(items: any[]): CartItemResponseDto[] {
    return items.map((item) => this.transformCartItem(item));
  }

  async findAll(userId: string, query?: CartQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_CART_FIELDS,
    );

    const select: Prisma.CartItemSelect = buildCartSelectQuery(sanitizedFields);

    const where: Prisma.CartItemWhereInput = {
      userId,
      deletedAt: null,
    };

    if (query?.productId) {
      where.productId = query.productId;
    }

    const page: number = query?.page ?? 1;
    const limit: number = query?.limit ?? 10;
    const skip: number = (page - 1) * limit;

    const [cartItems, total] = await Promise.all([
      this.prisma.cartItem.findMany({
        where,
        select,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.cartItem.count({ where }),
    ]);

    return {
      data: this.transformCartItems(cartItems),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, userId: string, query?: CartQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_CART_FIELDS,
    );

    const select: Prisma.CartItemSelect = buildCartSelectQuery(sanitizedFields);

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id, deletedAt: null },
      select,
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${id} not found`);
    }

    if (cartItem.userId !== userId) {
      throw new BadRequestException('Unauthorized to access this cart item');
    }

    return this.transformCartItem(cartItem);
  }

  async create(createCartItemDto: CreateCartItemDto, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: createCartItemDto.productId, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${createCartItemDto.productId} not found`,
      );
    }

    if (product.stock < (createCartItemDto.quantity || 1)) {
      throw new BadRequestException(
        `Insufficient stock for product. Available: ${product.stock}`,
      );
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        userId,
        productId: createCartItemDto.productId,
        deletedAt: null,
      },
    });

    if (existingItem) {
      return this.transformCartItem(
        await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + (createCartItemDto.quantity || 1),
          },
          select: CART_DEFAULT_SELECT,
        }),
      );
    }

    return this.transformCartItem(
      await this.prisma.cartItem.create({
        data: {
          ...createCartItemDto,
          userId,
          quantity: createCartItemDto.quantity ?? 1,
        },
        select: CART_DEFAULT_SELECT,
      }),
    );
  }

  async update(
    id: number,
    userId: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id, deletedAt: null },
      include: { product: true },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${id} not found`);
    }

    if (cartItem.userId !== userId) {
      throw new BadRequestException('Unauthorized to update this cart item');
    }

    if (
      updateCartItemDto.quantity &&
      cartItem.product.stock < updateCartItemDto.quantity
    ) {
      throw new BadRequestException(
        `Insufficient stock for product. Available: ${cartItem.product.stock}`,
      );
    }

    return this.transformCartItem(
      await this.prisma.cartItem.update({
        where: { id },
        data: updateCartItemDto,
        select: CART_DEFAULT_SELECT,
      }),
    );
  }

  async remove(id: number, userId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id, deletedAt: null },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${id} not found`);
    }

    if (cartItem.userId !== userId) {
      throw new BadRequestException('Unauthorized to delete this cart item');
    }

    await this.prisma.cartItem.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Cart item deleted successfully' };
  }

  async clearCart(userId: string) {
    const deleted = await this.prisma.cartItem.updateMany({
      where: {
        userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: `${deleted.count} items removed from cart` };
  }

  async restore(id: number, userId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id, deletedAt: { not: null } },
    });

    if (!cartItem) {
      throw new NotFoundException(`Deleted cart item with ID ${id} not found`);
    }

    if (cartItem.userId !== userId) {
      throw new BadRequestException('Unauthorized to restore this cart item');
    }

    return this.transformCartItem(
      await this.prisma.cartItem.update({
        where: { id },
        data: {
          deletedAt: null,
        },
        select: CART_DEFAULT_SELECT,
      }),
    );
  }
}
