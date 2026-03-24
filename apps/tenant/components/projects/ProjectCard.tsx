'use client';

import { Card, CardContent, CardHeader, Badge } from '@kaven/ui-base';
import { Calendar, Users, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import type { Project } from '@/types/projects';

interface ProjectCardProps {
  project: Project;
}

const statusColors: Record<string, string> = {
  PLANNING: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
  ARCHIVED: 'bg-gray-200 text-gray-600',
};

export function ProjectCard({ project }: ProjectCardProps) {
  const progressPercent = Math.min(100, Math.max(0, project.progress));

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: project.color || '#3B82F6' }}
            />
            <Badge className={statusColors[project.status] || 'bg-gray-100'}>
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
          <h3 className="font-semibold mt-2 line-clamp-1">{project.name}</h3>
          {project.code && (
            <span className="text-xs text-muted-foreground">{project.code}</span>
          )}
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {project.description || 'No description'}
          </p>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>{project._count?.tasks || 0} tasks</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{project._count?.members || 0}</span>
              </div>
            </div>
            {project.endDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(project.endDate), 'MMM d')}</span>
              </div>
            )}
          </div>

          {/* Budget info */}
          {project.budgetAmount && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {project.currency}{' '}
                {project.costIncurred.toLocaleString()} / {project.budgetAmount.toLocaleString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
