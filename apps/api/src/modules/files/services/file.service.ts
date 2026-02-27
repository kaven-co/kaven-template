import { FastifyRequest, FastifyReply } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import { prisma } from '../../../lib/prisma';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export class FileService {
  constructor() {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }
  }

  async upload(file: MultipartFile, userId: string, tenantId?: string) {
    // Validar tamanho
    if (file.file.bytesRead > MAX_FILE_SIZE) {
      throw new Error(`Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Validar tipo
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new Error(`Tipo de arquivo não permitido: ${file.mimetype}`);
    }

    // Gerar nome único
    const ext = path.extname(file.filename);
    const filename = `${crypto.randomUUID()}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Salvar arquivo
    const buffer = await file.toBuffer();
    await writeFile(filepath, buffer);

    // Criar registro no banco
    const fileRecord = await prisma.file.create({
      data: {
        filename,
        originalName: file.filename,
        mimeType: file.mimetype,
        size: buffer.length,
        path: filepath,
        url: `/uploads/${filename}`,
        userId,
        tenantId,
      },
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimeType: true,
        size: true,
        url: true,
        createdAt: true,
      },
    });

    return fileRecord;
  }

  async getById(id: string, userId: string) {
    const file = await prisma.file.findFirst({
      where: {
        id,
        userId, // Só pode acessar próprios arquivos
        deletedAt: null,
      },
    });

    if (!file) {
      throw new Error('Arquivo não encontrado');
    }

    return file;
  }

  async list(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        select: {
          id: true,
          filename: true,
          originalName: true,
          mimeType: true,
          size: true,
          url: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.file.count({
        where: {
          userId,
          deletedAt: null,
        },
      }),
    ]);

    return {
      files,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Upload and process an avatar image.
   * Validates: max 2MB, JPG/PNG/WebP only.
   * Produces two sizes: 128x128 (thumbnail) and 256x256 (profile).
   * Files are scoped to tenantId for multi-tenant isolation.
   */
  async uploadAvatar(
    file: MultipartFile,
    userId: string,
    tenantId?: string,
  ): Promise<{ thumbnail: string; profile: string }> {
    const AVATAR_MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const AVATAR_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];

    // Validate MIME type
    if (!AVATAR_MIMETYPES.includes(file.mimetype)) {
      throw new Error(
        `Invalid avatar format: ${file.mimetype}. Allowed: JPG, PNG, WebP`,
      );
    }

    // Read buffer and validate size
    const buffer = await file.toBuffer();
    if (buffer.length > AVATAR_MAX_SIZE) {
      throw new Error(
        `Avatar too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB). Maximum: 2MB`,
      );
    }

    // Build tenant-scoped directory
    const scope = tenantId ? `tenant-${tenantId}` : 'global';
    const avatarDir = path.join(UPLOAD_DIR, 'avatars', scope);
    if (!existsSync(avatarDir)) {
      await mkdir(avatarDir, { recursive: true });
    }

    const baseId = crypto.randomUUID();

    // Resize to 128x128 thumbnail
    const thumbName = `${baseId}_128.webp`;
    const thumbPath = path.join(avatarDir, thumbName);
    await sharp(buffer)
      .resize(128, 128, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toFile(thumbPath);

    // Resize to 256x256 profile
    const profileName = `${baseId}_256.webp`;
    const profilePath = path.join(avatarDir, profileName);
    await sharp(buffer)
      .resize(256, 256, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(profilePath);

    const thumbnailUrl = `/uploads/avatars/${scope}/${thumbName}`;
    const profileUrl = `/uploads/avatars/${scope}/${profileName}`;

    // Persist thumbnail record in DB
    await prisma.file.create({
      data: {
        filename: thumbName,
        originalName: file.filename,
        mimeType: 'image/webp',
        size: buffer.length,
        path: thumbPath,
        url: thumbnailUrl,
        userId,
        tenantId,
      },
    });

    // Persist profile record in DB
    await prisma.file.create({
      data: {
        filename: profileName,
        originalName: file.filename,
        mimeType: 'image/webp',
        size: buffer.length,
        path: profilePath,
        url: profileUrl,
        userId,
        tenantId,
      },
    });

    return { thumbnail: thumbnailUrl, profile: profileUrl };
  }

  async delete(id: string, userId: string) {
    const file = await this.getById(id, userId);

    // Soft delete no banco
    await prisma.file.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Deletar arquivo físico
    try {
      await unlink(file.path);
    } catch (error) {
      console.warn('Erro ao deletar arquivo físico:', error);
    }

    return { message: 'Arquivo deletado com sucesso' };
  }
}

export const fileService = new FileService();
