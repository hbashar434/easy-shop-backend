import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/product-create.dto';
import { UpdateProductDto } from './dto/product-update.dto';
import { Prisma, Status } from '@prisma/client';
import { sanitizeQuery } from 'src/common/sanitizers/query-sanitizers';
import { ProductQueryDto } from './dto/product-query.dto';
import { buildProductSelectQuery } from './queries/product.query-builder';
import {
  PRODUCT_DEFAULT_SELECT,
  ALLOWED_PRODUCT_FIELDS,
} from './queries/product.default-query';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: ProductQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_PRODUCT_FIELDS,
    );

    const select: Prisma.ProductSelect =
      buildProductSelectQuery(sanitizedFields);

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query?.brandId) {
      where.brandId = query.brandId;
    }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search } },
        { slug: { contains: query.search } },
        { sku: { contains: query.search } },
      ];
    }

    if (query?.minPrice !== undefined || query?.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.price.lte = query.maxPrice;
      }
    }

    const page: number = query?.page ?? 1;
    const limit: number = query?.limit ?? 10;
    const skip: number = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        select,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, query?: ProductQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_PRODUCT_FIELDS,
    );

    const select: Prisma.ProductSelect =
      buildProductSelectQuery(sanitizedFields);

    const product = await this.prisma.product.findUnique({
      where: { id, deletedAt: null },
      select,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    if (createProductDto.slug) {
      const existing = await this.prisma.product.findFirst({
        where: {
          slug: createProductDto.slug,
          deletedAt: null,
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Product with slug "${createProductDto.slug}" already exists`,
        );
      }
    }

    if (createProductDto.sku) {
      const existing = await this.prisma.product.findFirst({
        where: {
          sku: createProductDto.sku,
          deletedAt: null,
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Product with SKU "${createProductDto.sku}" already exists`,
        );
      }
    }

    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${createProductDto.categoryId} not found`,
      );
    }

    if (createProductDto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: createProductDto.brandId, deletedAt: null },
      });

      if (!brand) {
        throw new NotFoundException(
          `Brand with ID ${createProductDto.brandId} not found`,
        );
      }
    }

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        status: createProductDto.status ?? Status.ACTIVE,
        stock: createProductDto.stock ?? 0,
        sortOrder: createProductDto.sortOrder ?? 0,
      },
      select: PRODUCT_DEFAULT_SELECT,
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (updateProductDto.slug) {
      const existing = await this.prisma.product.findFirst({
        where: {
          slug: updateProductDto.slug,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Product with slug "${updateProductDto.slug}" already exists`,
        );
      }
    }

    if (updateProductDto.sku) {
      const existing = await this.prisma.product.findFirst({
        where: {
          sku: updateProductDto.sku,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Product with SKU "${updateProductDto.sku}" already exists`,
        );
      }
    }

    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId, deletedAt: null },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateProductDto.categoryId} not found`,
        );
      }
    }

    if (updateProductDto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: updateProductDto.brandId, deletedAt: null },
      });

      if (!brand) {
        throw new NotFoundException(
          `Brand with ID ${updateProductDto.brandId} not found`,
        );
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      select: PRODUCT_DEFAULT_SELECT,
    });
  }

  async remove(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const cartItemsCount = await this.prisma.cartItem.count({
      where: {
        productId: id,
        deletedAt: null,
      },
    });

    if (cartItemsCount > 0) {
      throw new BadRequestException(
        'Cannot delete product with items in cart. Please remove cart items first.',
      );
    }

    const orderItemsCount = await this.prisma.orderItem.count({
      where: {
        productId: id,
      },
    });

    if (orderItemsCount > 0) {
      throw new BadRequestException(
        'Cannot delete product with order history. Product has been ordered.',
      );
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: Status.INACTIVE,
      },
    });

    return { message: 'Product deleted successfully' };
  }

  async restore(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id, deletedAt: { not: null } },
    });

    if (!product) {
      throw new NotFoundException(`Deleted product with ID ${id} not found`);
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: null,
        status: Status.ACTIVE,
      },
      select: PRODUCT_DEFAULT_SELECT,
    });
  }
}
