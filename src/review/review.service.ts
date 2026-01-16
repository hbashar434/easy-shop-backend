import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/review-create.dto';
import { UpdateReviewDto } from './dto/review-update.dto';
import { Prisma, Status } from '@prisma/client';
import { sanitizeQuery } from 'src/common/sanitizers/query-sanitizers';
import { ReviewQueryDto } from './dto/review-query.dto';
import { buildReviewSelectQuery } from './queries/review.query-builder';
import {
  REVIEW_DEFAULT_SELECT,
  ALLOWED_REVIEW_FIELDS,
} from './queries/review.default-query';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: ReviewQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_REVIEW_FIELDS,
    );

    const select: Prisma.ReviewSelect = buildReviewSelectQuery(sanitizedFields);

    const where: Prisma.ReviewWhereInput = {
      deletedAt: null,
    };

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.productId) {
      where.productId = query.productId;
    }

    if (query?.userId) {
      where.userId = query.userId;
    }

    if (query?.rating) {
      where.rating = query.rating;
    }

    if (query?.search) {
      where.comment = { contains: query.search };
    }

    const page: number = query?.page ?? 1;
    const limit: number = query?.limit ?? 10;
    const skip: number = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        select,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, query?: ReviewQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_REVIEW_FIELDS,
    );

    const select: Prisma.ReviewSelect = buildReviewSelectQuery(sanitizedFields);

    const review = await this.prisma.review.findUnique({
      where: { id, deletedAt: null },
      select,
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async create(createReviewDto: CreateReviewDto, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: createReviewDto.productId, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${createReviewDto.productId} not found`,
      );
    }

    return this.prisma.review.create({
      data: {
        ...createReviewDto,
        userId,
        status: createReviewDto.status ?? Status.ACTIVE,
        sortOrder: createReviewDto.sortOrder ?? 0,
      },
      select: REVIEW_DEFAULT_SELECT,
    });
  }

  async update(id: number, updateReviewDto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id, deletedAt: null },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
      select: REVIEW_DEFAULT_SELECT,
    });
  }

  async remove(id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id, deletedAt: null },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    await this.prisma.review.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: Status.INACTIVE,
      },
    });

    return { message: 'Review deleted successfully' };
  }

  async restore(id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id, deletedAt: { not: null } },
    });

    if (!review) {
      throw new NotFoundException(`Deleted review with ID ${id} not found`);
    }

    return this.prisma.review.update({
      where: { id },
      data: {
        deletedAt: null,
        status: Status.ACTIVE,
      },
      select: REVIEW_DEFAULT_SELECT,
    });
  }
}
