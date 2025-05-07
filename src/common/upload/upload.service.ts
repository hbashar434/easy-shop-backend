import { Injectable, Inject } from '@nestjs/common';
import { UploadStrategy } from './interfaces/upload.interface';

@Injectable()
export class UploadService {
  constructor(
    @Inject('UPLOAD_STRATEGY') private readonly uploadStrategy: UploadStrategy,
  ) {}

  uploadFile(file: Express.Multer.File) {
    return this.uploadStrategy.uploadFile(file);
  }
}
