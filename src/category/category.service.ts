import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/category-create.dto';
import { UpdateCategoryDto } from './dto/category-update.dto';
import { Prisma, Status } from '@prisma/client';
import { sanitizeQuery } from 'src/common/sanitizers/query-sanitizers';
import { CategoryQueryDto } from './dto/category-query.dto';
import { buildCategorySelectQuery } from './queries/category.query-builder';
import {
  CATEGORY_DEFAULT_SELECT,
  ALLOWED_CATEGORY_FIELDS,
} from './queries/category.default-query';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: CategoryQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_CATEGORY_FIELDS,
    );

    const select: Prisma.CategorySelect =
      buildCategorySelectQuery(sanitizedFields);

    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
    };

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.parentId !== undefined) {
      where.parentId = query.parentId;
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

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        select,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, query?: CategoryQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_CATEGORY_FIELDS,
    );

    const select: Prisma.CategorySelect =
      buildCategorySelectQuery(sanitizedFields);

    const category = await this.prisma.category.findUnique({
      where: { id, deletedAt: null },
      select,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const existing = await this.prisma.category.findFirst({
      where: {
        slug: createCategoryDto.slug,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Category with slug "${createCategoryDto.slug}" already exists`,
      );
    }

    if (
      createCategoryDto.parentId !== undefined &&
      createCategoryDto.parentId !== null
    ) {
      const parent = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId, deletedAt: null },
      });

      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID ${createCategoryDto.parentId} not found`,
        );
      }
    }

    let depth = 0;
    if (createCategoryDto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId },
        select: { depth: true },
      });
      depth = (parent?.depth ?? 0) + 1;
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        depth,
        status: createCategoryDto.status ?? Status.ACTIVE,
        sortOrder: createCategoryDto.sortOrder ?? 0,
      },
      select: CATEGORY_DEFAULT_SELECT,
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      if (updateCategoryDto.parentId !== null) {
        const parent = await this.prisma.category.findUnique({
          where: { id: updateCategoryDto.parentId, deletedAt: null },
        });

        if (!parent) {
          throw new NotFoundException(
            `Parent category with ID ${updateCategoryDto.parentId} not found`,
          );
        }

        const isCircular = await this.checkCircularReference(
          id,
          updateCategoryDto.parentId,
        );
        if (isCircular) {
          throw new BadRequestException(
            'Cannot set parent: would create circular reference',
          );
        }
      }
    }

    if (updateCategoryDto.slug) {
      const existing = await this.prisma.category.findFirst({
        where: {
          slug: updateCategoryDto.slug,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Category with slug "${updateCategoryDto.slug}" already exists`,
        );
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      select: CATEGORY_DEFAULT_SELECT,
    });
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const childrenCount = await this.prisma.category.count({
      where: {
        parentId: id,
        deletedAt: null,
      },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        'Cannot delete category with subcategories. Please delete or move subcategories first.',
      );
    }

    const productsCount = await this.prisma.product.count({
      where: {
        categoryId: id,
        deletedAt: null,
      },
    });

    if (productsCount > 0) {
      throw new BadRequestException(
        'Cannot delete category with products. Please remove or reassign products first.',
      );
    }

    await this.prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: Status.INACTIVE,
      },
    });

    return { message: 'Category deleted successfully' };
  }

  async restore(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id, deletedAt: { not: null } },
    });

    if (!category) {
      throw new NotFoundException(`Deleted category with ID ${id} not found`);
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        deletedAt: null,
        status: Status.ACTIVE,
      },
      select: CATEGORY_DEFAULT_SELECT,
    });
  }

  private async checkCircularReference(
    categoryId: number,
    parentId: number,
  ): Promise<boolean> {
    let currentParentId: number | null = parentId;
    const visited = new Set<number>();

    while (currentParentId !== null) {
      if (currentParentId === categoryId) {
        return true;
      }

      if (visited.has(currentParentId)) {
        break;
      }

      visited.add(currentParentId);

      const parent = await this.prisma.category.findUnique({
        where: { id: currentParentId },
        select: { parentId: true },
      });

      currentParentId = parent?.parentId as number | null;
    }

    return false;
  }
}
