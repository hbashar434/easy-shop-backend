import { ApiProperty } from '@nestjs/swagger';
import { FilePurpose, EntityType, Status } from '@prisma/client';

export class UploadResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'https://example.com/uploads/image.jpg' })
  url: string;

  @ApiProperty({ example: 'image.jpg', nullable: true })
  fileName: string | null;

  @ApiProperty({ example: 'image/jpeg', nullable: true })
  fileType: string | null;

  @ApiProperty({ example: 1024, nullable: true })
  fileSize: number | null;

  @ApiProperty({
    enum: FilePurpose,
    example: FilePurpose.PRODUCT_IMAGE,
    enumName: 'FilePurpose',
  })
  filePurpose: FilePurpose;

  @ApiProperty({
    enum: EntityType,
    example: EntityType.PRODUCT,
    nullable: true,
    enumName: 'EntityType',
  })
  entityType: EntityType | null;

  @ApiProperty({ example: '1', nullable: true })
  entityId: string | null;

  @ApiProperty({
    enum: Status,
    example: Status.ACTIVE,
    enumName: 'Status',
  })
  status: Status;

  @ApiProperty({ example: 'Alt text for image', nullable: true })
  alt: string | null;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({ example: 'uuid-string', nullable: true })
  uploadedById: string | null;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ example: null, nullable: true })
  deletedAt: Date | null;
}
