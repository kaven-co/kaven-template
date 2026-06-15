'use client';
import { useState } from 'react';

interface FileUploaderProps {
  onUpload?: (key: string) => void;
  accept?: string;
}

export function FileUploader({ onUpload, accept = '*/*' }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Obtém presigned URL do backend
      const { uploadUrl, key } = await fetch('/api/storage/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      }).then((r) => r.json());

      // Upload direto para S3/R2 via presigned URL
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      onUpload?.(key);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        accept={accept}
        onChange={handleFile}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-amber-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-amber-700 hover:file:bg-amber-100"
      />
      {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
