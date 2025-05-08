import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadStrategy } from '../interfaces/upload.interface';
import * as fs from 'fs';
import * as path from 'path';
import { Multer } from 'multer';

@Injectable()
export class LocalUploadStrategy implements UploadStrategy {
  private readonly uploadDir = 'uploads';

  constructor(private configService: ConfigService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadDir, filename);

    await fs.promises.writeFile(filePath, file.buffer);

    const serverUrl = this.configService.get<string>('APP_URL');
    return {
      url: `${serverUrl}/uploads/${filename}`,
    };
  }
}
