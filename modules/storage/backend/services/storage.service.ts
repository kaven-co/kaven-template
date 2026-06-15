import { S3Provider } from './providers/s3.provider';

export interface StorageProvider {
  getPresignedUploadUrl(key: string, contentType: string, expiresIn?: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
  listObjects(prefix: string): Promise<Array<{ key: string; size: number; lastModified: Date }>>;
}

export function createStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? 's3';
  if (provider === 's3' || provider === 'r2') {
    return new S3Provider();
  }
  throw new Error(`Unsupported storage provider: ${provider}`);
}
