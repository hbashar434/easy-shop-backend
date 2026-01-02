import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductTagDto } from './dto/product-tag-create.dto';
import { UpdateProductTagDto } from './dto/product-tag-update.dto';
import { Prisma } from '@prisma/client';
import { sanitizeQuery } from 'src/common/sanitizers/query-sanitizers';
import { ProductTagQueryDto } from './dto/product-tag-query.dto';
import { buildProductTagSelectQuery } from './queries/product-tag.query-builder';
import {
  PRODUCT_TAG_DEFAULT_SELECT,
  ALLOWED_PRODUCT_TAG_FIELDS,
} from './queries/product-tag.default-query';

@Injectable()
export class ProductTagService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: ProductTagQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_PRODUCT_TAG_FIELDS,
    );

    const select: Prisma.ProductTagSelect = buildProductTagSelectQuery(
      sanitizedFields,
    );

    const where: Prisma.ProductTagWhereInput = {};

    if (query?.productId) {
      where.productId = query.productId;
    }

    if (query?.search) {
      where.name = { contains: query.search };
    }

    const page: number = query?.page ?? 1;
    const limit: number = query?.limit ?? 10;
    const skip: number = (page - 1) * limit;

    const [productTags, total] = await Promise.all([
      this.prisma.productTag.findMany({
        where,
        select,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.productTag.count({ where }),
    ]);

    return {
      data: productTags,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, query?: ProductTagQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_PRODUCT_TAG_FIELDS,
    );

    const select: Prisma.ProductTagSelect = buildProductTagSelectQuery(
      sanitizedFields,
    );

    const productTag = await this.prisma.productTag.findUnique({
      where: { id },
      select,
    });

    if (!productTag) {
      throw new NotFoundException(`Product tag with ID ${id} not found`);
    }

    return productTag;
  }

  async create(createProductTagDto: CreateProductTagDto) {
    const existing = await this.prisma.productTag.findFirst({
      where: {
        name: createProductTagDto.name,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Product tag with name "${createProductTagDto.name}" already exists`,
      );
    }

    const product = await this.prisma.product.findUnique({
      where: { id: createProductTagDto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${createProductTagDto.productId} not found`,
      );
    }

    return this.prisma.productTag.create({
      data: createProductTagDto,
      select: PRODUCT_TAG_DEFAULT_SELECT,
    });
  }

  async update(id: number, updateProductTagDto: UpdateProductTagDto) {
    const productTag = await this.prisma.productTag.findUnique({
      where: { id },
    });

    if (!productTag) {
      throw new NotFoundException(`Product tag with ID ${id} not found`);
    }

    if (updateProductTagDto.name) {
      const existing = await this.prisma.productTag.findFirst({
        where: {
          name: updateProductTagDto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Product tag with name "${updateProductTagDto.name}" already exists`,
        );
      }
    }

    if (updateProductTagDto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: updateProductTagDto.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${updateProductTagDto.productId} not found`,
        );
      }
    }

    return this.prisma.productTag.update({
      where: { id },
      data: updateProductTagDto,
      select: PRODUCT_TAG_DEFAULT_SELECT,
    });
  }

  async remove(id: number) {
    const productTag = await this.prisma.productTag.findUnique({
      where: { id },
    });

    if (!productTag) {
      throw new NotFoundException(`Product tag with ID ${id} not found`);
    }

    await this.prisma.productTag.delete({
      where: { id },
    });

    return { message: 'Product tag deleted successfully' };
  }
}

