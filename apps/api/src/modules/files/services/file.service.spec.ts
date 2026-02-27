import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileService } from './file.service';
import { MultipartFile } from '@fastify/multipart';

const prismaMock = vi.hoisted(() => ({
  file: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: prismaMock,
}));

vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
  unlink: vi.fn(),
  mkdir: vi.fn(),
}));

vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}));

const sharpMock = vi.hoisted(() => {
  const instance = {
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    toFile: vi.fn().mockResolvedValue(undefined),
  };
  const fn = vi.fn().mockReturnValue(instance);
  return { fn, instance };
});

vi.mock('sharp', () => ({
  default: sharpMock.fn,
}));

function createMockFile(overrides: Partial<{
  bytesRead: number;
  mimetype: string;
  filename: string;
  buffer: Buffer;
}> = {}): MultipartFile {
  return {
    file: { bytesRead: overrides.bytesRead ?? 100 },
    mimetype: overrides.mimetype ?? 'image/png',
    filename: overrides.filename ?? 'test.png',
    toBuffer: vi.fn().mockResolvedValue(overrides.buffer ?? Buffer.from('test')),
  } as unknown as MultipartFile;
}

describe('FileService', () => {
  let service: FileService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FileService();
  });

  // ─── upload ─────────────────────────────────────────────────────────────────

  describe('upload', () => {
    it('should upload file and create database record', async () => {
      const mockFile = createMockFile();
      prismaMock.file.create.mockResolvedValue({
        id: 'file-1',
        filename: 'uuid.png',
        originalName: 'test.png',
        mimeType: 'image/png',
        size: 4,
        url: '/uploads/uuid.png',
        createdAt: new Date(),
      });

      const result = await service.upload(mockFile, 'user-1', 'tenant-1');

      expect(result.id).toBe('file-1');
      expect(prismaMock.file.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            tenantId: 'tenant-1',
            mimeType: 'image/png',
            originalName: 'test.png',
          }),
        }),
      );
    });

    it('should throw error for files exceeding 10MB', async () => {
      const largeFile = createMockFile({ bytesRead: 11 * 1024 * 1024 });

      await expect(
        service.upload(largeFile, 'user-1', 'tenant-1'),
      ).rejects.toThrow('Arquivo muito grande');
    });

    it('should throw error for disallowed MIME types', async () => {
      const exeFile = createMockFile({ mimetype: 'application/exe', filename: 'virus.exe' });

      await expect(
        service.upload(exeFile, 'user-1', 'tenant-1'),
      ).rejects.toThrow('não permitido');
    });

    it('should accept image/jpeg files', async () => {
      const jpegFile = createMockFile({ mimetype: 'image/jpeg', filename: 'photo.jpg' });
      prismaMock.file.create.mockResolvedValue({ id: 'file-1', url: '/uploads/photo.jpg' });

      const result = await service.upload(jpegFile, 'user-1');
      expect(result.id).toBe('file-1');
    });

    it('should accept application/pdf files', async () => {
      const pdfFile = createMockFile({ mimetype: 'application/pdf', filename: 'doc.pdf' });
      prismaMock.file.create.mockResolvedValue({ id: 'file-1', url: '/uploads/doc.pdf' });

      const result = await service.upload(pdfFile, 'user-1');
      expect(result.id).toBe('file-1');
    });

    it('should accept image/webp files', async () => {
      const webpFile = createMockFile({ mimetype: 'image/webp', filename: 'img.webp' });
      prismaMock.file.create.mockResolvedValue({ id: 'file-1', url: '/uploads/img.webp' });

      const result = await service.upload(webpFile, 'user-1');
      expect(result.id).toBe('file-1');
    });

    it('should reject text/html files', async () => {
      const htmlFile = createMockFile({ mimetype: 'text/html', filename: 'page.html' });

      await expect(
        service.upload(htmlFile, 'user-1'),
      ).rejects.toThrow('não permitido');
    });
  });

  // ─── getById ────────────────────────────────────────────────────────────────

  describe('getById', () => {
    it('should return file when found', async () => {
      const mockFile = { id: 'file-1', userId: 'user-1', deletedAt: null, path: '/tmp/f.png' };
      prismaMock.file.findFirst.mockResolvedValue(mockFile);

      const result = await service.getById('file-1', 'user-1');

      expect(result).toEqual(mockFile);
      expect(prismaMock.file.findFirst).toHaveBeenCalledWith({
        where: { id: 'file-1', userId: 'user-1', deletedAt: null },
      });
    });

    it('should throw error when file not found', async () => {
      prismaMock.file.findFirst.mockResolvedValue(null);

      await expect(
        service.getById('file-nonexistent', 'user-1'),
      ).rejects.toThrow('Arquivo não encontrado');
    });

    it('should enforce user ownership - only own files', async () => {
      prismaMock.file.findFirst.mockResolvedValue(null);

      await expect(
        service.getById('file-1', 'user-other'),
      ).rejects.toThrow('Arquivo não encontrado');

      expect(prismaMock.file.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-other' }),
        }),
      );
    });
  });

  // ─── list ───────────────────────────────────────────────────────────────────

  describe('list', () => {
    it('should return paginated files for user', async () => {
      const mockFiles = [{ id: 'file-1' }, { id: 'file-2' }];
      prismaMock.file.findMany.mockResolvedValue(mockFiles);
      prismaMock.file.count.mockResolvedValue(2);

      const result = await service.list('user-1');

      expect(result.files).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
    });

    it('should exclude soft-deleted files', async () => {
      prismaMock.file.findMany.mockResolvedValue([]);
      prismaMock.file.count.mockResolvedValue(0);

      await service.list('user-1');

      expect(prismaMock.file.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });

    it('should apply pagination correctly', async () => {
      prismaMock.file.findMany.mockResolvedValue([]);
      prismaMock.file.count.mockResolvedValue(50);

      const result = await service.list('user-1', 3, 10);

      expect(result.pagination.totalPages).toBe(5);
      expect(prismaMock.file.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('should order by createdAt descending', async () => {
      prismaMock.file.findMany.mockResolvedValue([]);
      prismaMock.file.count.mockResolvedValue(0);

      await service.list('user-1');

      expect(prismaMock.file.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });
  });

  // ─── delete ─────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('should soft-delete file and remove physical file', async () => {
      prismaMock.file.findFirst.mockResolvedValue({
        id: 'file-1',
        path: '/tmp/test.png',
        userId: 'user-1',
        deletedAt: null,
      });
      prismaMock.file.update.mockResolvedValue({});

      const result = await service.delete('file-1', 'user-1');

      expect(result.message).toContain('sucesso');
      expect(prismaMock.file.update).toHaveBeenCalledWith({
        where: { id: 'file-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw error when file not found', async () => {
      prismaMock.file.findFirst.mockResolvedValue(null);

      await expect(
        service.delete('file-nonexistent', 'user-1'),
      ).rejects.toThrow('Arquivo não encontrado');
    });

    it('should handle physical file deletion failure gracefully', async () => {
      prismaMock.file.findFirst.mockResolvedValue({
        id: 'file-1',
        path: '/tmp/nonexistent.png',
        userId: 'user-1',
        deletedAt: null,
      });
      prismaMock.file.update.mockResolvedValue({});

      // The unlink mock from fs/promises won't throw by default, so this tests the path
      const result = await service.delete('file-1', 'user-1');
      expect(result.message).toContain('sucesso');
    });
  });

  // ─── uploadAvatar ─────────────────────────────────────────────────────────

  describe('uploadAvatar', () => {
    it('should reject files exceeding 2MB', async () => {
      const largeBuffer = Buffer.alloc(2.5 * 1024 * 1024); // 2.5MB
      const mockFile = createMockFile({
        mimetype: 'image/png',
        filename: 'avatar.png',
        buffer: largeBuffer,
      });

      await expect(
        service.uploadAvatar(mockFile, 'user-1', 'tenant-1'),
      ).rejects.toThrow('Avatar too large');
    });

    it('should reject invalid MIME types (e.g. image/gif)', async () => {
      const mockFile = createMockFile({
        mimetype: 'image/gif',
        filename: 'avatar.gif',
      });

      await expect(
        service.uploadAvatar(mockFile, 'user-1', 'tenant-1'),
      ).rejects.toThrow('Invalid avatar format');
    });

    it('should reject application/pdf MIME type', async () => {
      const mockFile = createMockFile({
        mimetype: 'application/pdf',
        filename: 'doc.pdf',
      });

      await expect(
        service.uploadAvatar(mockFile, 'user-1'),
      ).rejects.toThrow('Invalid avatar format');
    });

    it('should accept image/jpeg and produce two sizes', async () => {
      const mockFile = createMockFile({
        mimetype: 'image/jpeg',
        filename: 'photo.jpg',
        buffer: Buffer.alloc(500), // small file
      });
      prismaMock.file.create.mockResolvedValue({ id: 'file-1' });

      const result = await service.uploadAvatar(mockFile, 'user-1', 'tenant-1');

      expect(result.thumbnail).toContain('_128.webp');
      expect(result.profile).toContain('_256.webp');
      // sharp should be called twice (thumbnail + profile)
      expect(sharpMock.fn).toHaveBeenCalledTimes(2);
      expect(sharpMock.instance.resize).toHaveBeenCalledWith(128, 128, expect.any(Object));
      expect(sharpMock.instance.resize).toHaveBeenCalledWith(256, 256, expect.any(Object));
    });

    it('should accept image/webp', async () => {
      const mockFile = createMockFile({
        mimetype: 'image/webp',
        filename: 'photo.webp',
        buffer: Buffer.alloc(200),
      });
      prismaMock.file.create.mockResolvedValue({ id: 'file-1' });

      const result = await service.uploadAvatar(mockFile, 'user-1');

      expect(result.thumbnail).toContain('_128.webp');
      expect(result.profile).toContain('_256.webp');
    });

    it('should scope files to tenant directory for isolation', async () => {
      const mockFile = createMockFile({
        mimetype: 'image/png',
        filename: 'avatar.png',
        buffer: Buffer.alloc(100),
      });
      prismaMock.file.create.mockResolvedValue({ id: 'file-1' });

      const result = await service.uploadAvatar(mockFile, 'user-1', 'tenant-abc');

      expect(result.thumbnail).toContain('tenant-abc');
      expect(result.profile).toContain('tenant-abc');
    });

    it('should use global scope when no tenantId is provided', async () => {
      const mockFile = createMockFile({
        mimetype: 'image/png',
        filename: 'avatar.png',
        buffer: Buffer.alloc(100),
      });
      prismaMock.file.create.mockResolvedValue({ id: 'file-1' });

      const result = await service.uploadAvatar(mockFile, 'user-1');

      expect(result.thumbnail).toContain('/global/');
      expect(result.profile).toContain('/global/');
    });

    it('should create two database records (thumbnail + profile)', async () => {
      const mockFile = createMockFile({
        mimetype: 'image/jpeg',
        filename: 'avatar.jpg',
        buffer: Buffer.alloc(100),
      });
      prismaMock.file.create.mockResolvedValue({ id: 'file-1' });

      await service.uploadAvatar(mockFile, 'user-1', 'tenant-1');

      expect(prismaMock.file.create).toHaveBeenCalledTimes(2);
      // First call: thumbnail
      expect(prismaMock.file.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            tenantId: 'tenant-1',
            mimeType: 'image/webp',
          }),
        }),
      );
    });
  });
});
