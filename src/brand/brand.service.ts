import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/brand-create.dto';
import { UpdateBrandDto } from './dto/brand-update.dto';
import { Prisma, Status } from '@prisma/client';
import { sanitizeQuery } from 'src/common/sanitizers/query-sanitizers';
import { BrandQueryDto } from './dto/brand-query.dto';
import { buildBrandSelectQuery } from './queries/brand.query-builder';
import {
  BRAND_DEFAULT_SELECT,
  ALLOWED_BRAND_FIELDS,
} from './queries/brand.default-query';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: BrandQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_BRAND_FIELDS,
    );

    const select: Prisma.BrandSelect = buildBrandSelectQuery(sanitizedFields);

    const where: Prisma.BrandWhereInput = {
      deletedAt: null,
    };

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search } },
        { slug: { contains: query.search } },
      ];
    }

    const page: number = query?.page ?? 1;
    const limit: number = query?.limit ?? 10;
    const skip: number = (page - 1) * limit;

    const [brands, total] = await Promise.all([
      this.prisma.brand.findMany({
        where,
        select,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.brand.count({ where }),
    ]);

    return {
      data: brands,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, query?: BrandQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_BRAND_FIELDS,
    );

    const select: Prisma.BrandSelect = buildBrandSelectQuery(sanitizedFields);

    const brand = await this.prisma.brand.findUnique({
      where: { id, deletedAt: null },
      select,
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    return brand;
  }

  async create(createBrandDto: CreateBrandDto) {
    const existing = await this.prisma.brand.findFirst({
      where: {
        slug: createBrandDto.slug,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Brand with slug "${createBrandDto.slug}" already exists`,
      );
    }

    const existingName = await this.prisma.brand.findFirst({
      where: {
        name: createBrandDto.name,
        deletedAt: null,
      },
    });

    if (existingName) {
      throw new BadRequestException(
        `Brand with name "${createBrandDto.name}" already exists`,
      );
    }

    return this.prisma.brand.create({
      data: {
        ...createBrandDto,
        status: createBrandDto.status ?? Status.ACTIVE,
        sortOrder: createBrandDto.sortOrder ?? 0,
      },
      select: BRAND_DEFAULT_SELECT,
    });
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    const brand = await this.prisma.brand.findUnique({
      where: { id, deletedAt: null },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    if (updateBrandDto.slug) {
      const existing = await this.prisma.brand.findFirst({
        where: {
          slug: updateBrandDto.slug,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Brand with slug "${updateBrandDto.slug}" already exists`,
        );
      }
    }

    if (updateBrandDto.name) {
      const existing = await this.prisma.brand.findFirst({
        where: {
          name: updateBrandDto.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Brand with name "${updateBrandDto.name}" already exists`,
        );
      }
    }

    return this.prisma.brand.update({
      where: { id },
      data: updateBrandDto,
      select: BRAND_DEFAULT_SELECT,
    });
  }

  async remove(id: number) {
    const brand = await this.prisma.brand.findUnique({
      where: { id, deletedAt: null },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    const productsCount = await this.prisma.product.count({
      where: {
        brandId: id,
        deletedAt: null,
      },
    });

    if (productsCount > 0) {
      throw new BadRequestException(
        'Cannot delete brand with products. Please remove or reassign products first.',
      );
    }

    await this.prisma.brand.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: Status.INACTIVE,
      },
    });

    return { message: 'Brand deleted successfully' };
  }

  async restore(id: number) {
    const brand = await this.prisma.brand.findUnique({
      where: { id, deletedAt: { not: null } },
    });

    if (!brand) {
      throw new NotFoundException(`Deleted brand with ID ${id} not found`);
    }

    return this.prisma.brand.update({
      where: { id },
      data: {
        deletedAt: null,
        status: Status.ACTIVE,
      },
      select: BRAND_DEFAULT_SELECT,
    });
  }
}
