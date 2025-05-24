import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { UploadStrategy } from './interfaces/upload.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { maxFileSize } from '../../constants/upload.constants';
import { Status, FilePurpose, EntityType } from '@prisma/client';
import { UploadQueryDto } from './dto/upload-query.dto';
import {
  allowedFieldsForUpload,
  allowedRelationsForUpload,
  allowedRelationFieldsForUpload,
  defaultWhereForUpload,
  defaultSelectForUpload,
} from '../../constants/upload.constants';
import {
  sanitizeQuery,
  sanitizeQueryForUnique,
} from '../../common/sanitizers/query-sanitizers';
import { AuthRequest } from '../../common/interfaces/request.interface';

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
      select: defaultSelectForUpload,
    });

    return upload;
  }

  async findAll(query: UploadQueryDto) {
    const queryOptions = sanitizeQuery(
      query,
      allowedFieldsForUpload,
      allowedRelationsForUpload,
      allowedRelationFieldsForUpload,
      defaultWhereForUpload,
      defaultSelectForUpload,
      {},
    );

    return this.prisma.upload.findMany(queryOptions);
  }

  async findOne(id: number, query?: UploadQueryDto) {
    const queryOptions = sanitizeQueryForUnique(
      query,
      allowedFieldsForUpload,
      allowedRelationsForUpload,
      allowedRelationFieldsForUpload,
      { id },
      defaultSelectForUpload,
      {},
    );

    const upload = await this.prisma.upload.findUnique(queryOptions);

    if (!upload) {
      throw new BadRequestException(`Upload with ID ${id} not found`);
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
      select: defaultSelectForUpload,
    });
  }
}
