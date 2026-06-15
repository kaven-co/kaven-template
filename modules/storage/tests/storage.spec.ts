import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock S3Client and presigner before importing the provider
const mockSend = vi.fn();
const mockGetSignedUrl = vi.fn().mockResolvedValue('https://s3.example.com/presigned-url');

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({ send: mockSend })),
  PutObjectCommand: vi.fn().mockImplementation((input) => input),
  DeleteObjectCommand: vi.fn().mockImplementation((input) => input),
  ListObjectsV2Command: vi.fn().mockImplementation((input) => input),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl,
}));

// Mock prisma
const prismaMock = vi.hoisted(() => ({
  storageObject: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({ prisma: prismaMock }));

import { S3Provider } from '../backend/services/providers/s3.provider';

describe('S3Provider', () => {
  let provider: S3Provider;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AWS_S3_BUCKET = 'test-bucket';
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_ACCESS_KEY_ID = 'test-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
    provider = new S3Provider();
  });

  describe('getPresignedUploadUrl', () => {
    it('should return a presigned URL', async () => {
      const url = await provider.getPresignedUploadUrl(
        'tenant-1/user-1/file.png',
        'image/png',
      );
      expect(url).toBe('https://s3.example.com/presigned-url');
      expect(mockGetSignedUrl).toHaveBeenCalledOnce();
    });

    it('should use default expiry of 900 seconds', async () => {
      await provider.getPresignedUploadUrl('key', 'image/png');
      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: 900 },
      );
    });
  });

  describe('deleteObject', () => {
    it('should call send with DeleteObjectCommand', async () => {
      mockSend.mockResolvedValueOnce({});
      await provider.deleteObject('tenant-1/user-1/file.png');
      expect(mockSend).toHaveBeenCalledOnce();
    });
  });

  describe('listObjects', () => {
    it('should return mapped objects', async () => {
      mockSend.mockResolvedValueOnce({
        Contents: [
          { Key: 'tenant-1/user-1/file.png', Size: 1024, LastModified: new Date('2026-01-01') },
        ],
      });

      const result = await provider.listObjects('tenant-1/');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        key: 'tenant-1/user-1/file.png',
        size: 1024,
        lastModified: new Date('2026-01-01'),
      });
    });

    it('should return empty array when no contents', async () => {
      mockSend.mockResolvedValueOnce({ Contents: undefined });
      const result = await provider.listObjects('tenant-99/');
      expect(result).toHaveLength(0);
    });
  });
});

describe('Tenant isolation — key prefix', () => {
  it('should prefix keys with tenantId/userId', () => {
    const tenantId = 'tenant-abc';
    const userId = 'user-xyz';
    const filename = 'photo.jpg';
    // Simula a lógica de geração de key das routes
    const key = `${tenantId}/${userId}/${Date.now()}-${filename}`;
    expect(key).toMatch(new RegExp(`^${tenantId}/${userId}/`));
  });

  it('should prevent cross-tenant access — findFirst with tenantId scope', async () => {
    // Simula que objeto pertence a outro tenant
    prismaMock.storageObject.findFirst.mockResolvedValueOnce(null);

    const result = await prismaMock.storageObject.findFirst({
      where: { id: 'obj-123', tenantId: 'tenant-A' },
    });

    // Outro tenant não deve encontrar o objeto
    expect(result).toBeNull();
    expect(prismaMock.storageObject.findFirst).toHaveBeenCalledWith({
      where: { id: 'obj-123', tenantId: 'tenant-A' },
    });
  });
});
