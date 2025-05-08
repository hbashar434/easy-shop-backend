import { Injectable } from '@nestjs/common';
import { UploadStrategy } from '../interfaces/upload.interface';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudUploadStrategy implements UploadStrategy {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) {
            return reject(new Error(error.message || 'Cloudinary error'));
          }
          if (!result) {
            return reject(new Error('Upload failed: No result returned'));
          }
          resolve({ url: result.secure_url });
        },
      );

      const readable = new Readable();
      readable._read = () => {};
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }
}
