import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UploadStrategy } from './interfaces/upload.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Status, FilePurpose, EntityType } from '@prisma/client';
import { UploadQueryDto } from './dto/upload-query.dto';
import { sanitizeQuery } from '../../common/sanitizers/query-sanitizers';
import { AuthRequest } from '../../common/interfaces/request.interface';
import { buildUploadSelectQuery } from './queries/upload.query-builder';
import { UPLOAD_DEFAULT_SELECT } from './queries/upload.default-query';
import { ALLOWED_UPLOAD_FIELDS } from './queries/upload.default-query';
import { maxFileSize } from 'src/constant/upload.constant';

@Injectable()
export class UploadService {
  constructor(
    @Inject('UPLOAD_STRATEGY') private readonly uploadStrategy: UploadStrategy,
    private readonly prisma: PrismaService,
  ) {}

  private validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > maxFileSize) {
      throw new BadRequestException('File size exceeds 1MB limit');
    }

    // Add more validations as needed (file type, etc.)
  }

  async uploadFile(
    file: Express.Multer.File,
    filePurpose: FilePurpose = FilePurpose.OTHER,
    entityType?: EntityType,
    entityId?: string,
    userId?: string,
  ) {
    this.validateFile(file);

    const { url } = await this.uploadStrategy.uploadFile(file);

    const upload = await this.prisma.upload.create({
      data: {
        url,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        filePurpose,
        entityType,
        entityId,
        uploadedById: userId,
        status: Status.ACTIVE,
      },
      select: UPLOAD_DEFAULT_SELECT,
    });

    return upload;
  }

  async findAll(query?: UploadQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_UPLOAD_FIELDS,
    );

    const select: Prisma.UploadSelect = buildUploadSelectQuery(sanitizedFields);

    const where: Prisma.UploadWhereInput = {
      deletedAt: null,
    };

    if (query?.filePurpose) {
      where.filePurpose = query.filePurpose;
    }

    if (query?.entityType) {
      where.entityType = query.entityType;
    }

    if (query?.entityId) {
      where.entityId = query.entityId;
    }

    if (query?.status) {
      where.status = query.status;
    }

    const page: number = query?.page ?? 1;
    const limit: number = query?.limit ?? 10;
    const skip: number = (page - 1) * limit;

    const [uploads, total] = await Promise.all([
      this.prisma.upload.findMany({
        where,
        select,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.upload.count({ where }),
    ]);

    return {
      data: uploads,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, query?: UploadQueryDto) {
    const fields = query?.fields;
    const sanitizedFields: string[] = sanitizeQuery(
      fields,
      ALLOWED_UPLOAD_FIELDS,
    );

    const select: Prisma.UploadSelect = buildUploadSelectQuery(sanitizedFields);

    const upload = await this.prisma.upload.findUnique({
      where: { id, deletedAt: null },
      select,
    });

    if (!upload) {
      throw new NotFoundException(`Upload with ID ${id} not found`);
    }

    return upload;
  }

  async remove(id: number) {
    const upload = await this.prisma.upload.findUnique({
      where: { id, deletedAt: null },
    });

    if (!upload) {
      throw new BadRequestException(`Upload with ID ${id} not found`);
    }

    await this.prisma.upload.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: Status.INACTIVE,
      },
    });

    return { message: 'Upload deleted successfully' };
  }

  async restore(id: number) {
    const upload = await this.prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      throw new BadRequestException(`Upload with ID ${id} not found`);
    }

    if (!upload.deletedAt) {
      throw new BadRequestException('Upload is not deleted');
    }

    return this.prisma.upload.update({
      where: { id },
      data: {
        deletedAt: null,
        status: Status.ACTIVE,
      },
      select: UPLOAD_DEFAULT_SELECT,
    });
  }
}
