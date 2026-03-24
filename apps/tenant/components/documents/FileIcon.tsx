'use client';

import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  File,
  FileType,
} from 'lucide-react';

interface FileIconProps {
  mimeType?: string;
  isRichText?: boolean;
  className?: string;
}

export function FileIcon({ mimeType, isRichText, className = 'h-5 w-5' }: FileIconProps) {
  if (isRichText) {
    return <FileText className={className} />;
  }

  if (!mimeType) {
    return <File className={className} />;
  }

  if (mimeType.startsWith('image/')) {
    return <FileImage className={className} />;
  }
  if (mimeType.startsWith('video/')) {
    return <FileVideo className={className} />;
  }
  if (mimeType.startsWith('audio/')) {
    return <FileAudio className={className} />;
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel')) {
    return <FileSpreadsheet className={className} />;
  }
  if (mimeType.includes('pdf')) {
    return <FileType className={className} />;
  }
  if (
    mimeType.includes('javascript') ||
    mimeType.includes('typescript') ||
    mimeType.includes('json') ||
    mimeType.includes('xml') ||
    mimeType.includes('html')
  ) {
    return <FileCode className={className} />;
  }
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) {
    return <FileArchive className={className} />;
  }

  return <File className={className} />;
}
