import { Prisma } from '@prisma/client';

export const allowedFieldsForUpload: (keyof Prisma.UploadWhereInput)[] = [
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
];

export const allowedRelationsForUpload: string[] = [
  'uploadedBy',
  'userAvatar',
  'productPrimary',
  'productImages',
  'reviewImages',
  'categoryPrimary',
  'brandLogo',
];

export const allowedRelationFieldsForUpload: Record<string, string[]> = {
  uploadedBy: ['id', 'email', 'firstName', 'lastName'],
  userAvatar: ['id', 'url', 'alt'],
  productPrimary: ['id', 'name', 'slug'],
  productImages: ['id', 'name', 'slug'],
  reviewImages: ['id', 'rating', 'comment'],
  categoryPrimary: ['id', 'name', 'slug'],
  brandLogo: ['id', 'name', 'slug'],
};

export const defaultWhereForUpload: Prisma.UploadWhereInput = {
  deletedAt: null,
};

export const defaultSelectForUpload: Prisma.UploadSelect = {
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
};

export const maxFileSize = 1024 * 1024; // 1MB in bytes
