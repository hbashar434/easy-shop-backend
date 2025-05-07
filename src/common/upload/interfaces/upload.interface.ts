export interface UploadStrategy {
  uploadFile(file: Express.Multer.File): Promise<{ url: string }>;
}
