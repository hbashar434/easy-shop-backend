import { Prisma } from '@prisma/client';

export const UPLOAD_DEFAULT_SELECT: Prisma.UploadSelect = {
  id: true,
  url: true,
  fileName: true,
  fileType: true,
  fileSize: true,
  filePurpose: true,
  entityType: true,
  entityId: true,
  status: true,
  alt: true,
  sortOrder: true,
  uploadedById: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  uploadedBy: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
};

export const ALLOWED_UPLOAD_FIELDS = [
  'id',
  'url',
  'fileName',
  'fileType',
  'fileSize',
  'filePurpose',
  'entityType',
  'entityId',
  'status',
  'alt',
  'sortOrder',
  'uploadedById',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'uploadedBy',
] as const;
