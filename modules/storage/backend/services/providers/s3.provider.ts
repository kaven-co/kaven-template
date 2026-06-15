import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { StorageProvider } from '../storage.service';

export class S3Provider implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION ?? 'us-east-1',
      // R2: https://<account>.r2.cloudflarestorage.com
      endpoint: process.env.AWS_ENDPOINT_URL,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      },
    });
    this.bucket = process.env.AWS_S3_BUCKET ?? '';
  }

  async getPresignedUploadUrl(key: string, contentType: string, expiresIn = 900): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async listObjects(prefix: string): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
    const res = await this.client.send(
      new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix }),
    );
    return (res.Contents ?? []).map((obj) => ({
      key: obj.Key ?? '',
      size: obj.Size ?? 0,
      lastModified: obj.LastModified ?? new Date(),
    }));
  }
}
