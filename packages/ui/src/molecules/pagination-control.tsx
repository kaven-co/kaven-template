import * as React from 'react';
import { Button } from '../atoms/button';
import { Typography } from '../atoms/typography';

export interface PaginationControlProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function PaginationControl({ page, totalPages, onPrev, onNext }: PaginationControlProps) {
  return (
    <nav role="navigation" aria-label="Pagination" className="flex items-center gap-3">
      <Button variant="outline" onClick={onPrev} disabled={page <= 1} aria-label="Página anterior">
        Anterior
      </Button>
      <Typography variant="body-sm">Página {page} de {totalPages}</Typography>
      <Button variant="outline" onClick={onNext} disabled={page >= totalPages} aria-label="Próxima página">
        Próxima
      </Button>
    </nav>
  );
}
