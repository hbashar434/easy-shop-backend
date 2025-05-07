import { Injectable } from '@nestjs/common';
import { UploadStrategy } from '../interfaces/upload.interface';
import * as fs from 'fs';
import * as path from 'path';
import { Multer } from 'multer';

@Injectable()
export class LocalUploadStrategy implements UploadStrategy {
  private readonly uploadDir = 'uploads';

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadDir, filename);

    await fs.promises.writeFile(filePath, file.buffer);

    return {
      url: `/uploads/${filename}`,
    };
  }
}
