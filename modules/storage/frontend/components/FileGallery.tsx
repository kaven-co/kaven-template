'use client';
import { useEffect, useState } from 'react';

interface StorageObject {
  id: string;
  key: string;
  mimeType?: string;
  size: number;
  createdAt: string;
}

export function FileGallery() {
  const [objects, setObjects] = useState<StorageObject[]>([]);

  useEffect(() => {
    fetch('/api/storage')
      .then((r) => r.json())
      .then(setObjects)
      .catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {objects.map((obj) => (
        <div key={obj.id} className="rounded-lg border border-gray-200 p-3">
          <p className="truncate text-sm font-medium">{obj.key.split('/').pop()}</p>
          <p className="text-xs text-gray-500">{(obj.size / 1024).toFixed(1)} KB</p>
        </div>
      ))}
      {objects.length === 0 && (
        <p className="col-span-full text-sm text-gray-400">No files yet.</p>
      )}
    </div>
  );
}
