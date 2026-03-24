'use client';

import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card } from '@kaven/ui-base';
import { ArrowLeft, Plus, Building2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Department } from '@/types/people';

export default function DepartmentsPage() {
  const { tenant } = useTenant();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['departments', tenant?.id],
    queryFn: () =>
      api.get('/api/v1/people/departments/tree').then((r) => r.data),
    enabled: !!tenant?.id,
  });

  const departments: Department[] = data || [];

  // Build tree: top-level departments (no parent)
  const topLevel = departments.filter((d) => !d.parentId);

  const getChildren = (parentId: string): Department[] =>
    departments.filter((d) => d.parentId === parentId);

  const renderDepartment = (dept: Department, depth: number = 0) => {
    const children = getChildren(dept.id);
    const employeeCount = dept._count?.employees || dept.headcount || 0;

    return (
      <div key={dept.id} style={{ marginLeft: depth * 24 }}>
        <Card className="p-4 mb-2 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{dept.name}</h3>
                {dept.code && (
                  <span className="text-xs text-muted-foreground">{dept.code}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{employeeCount}</span>
              </div>
              {children.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {children.length} sub-dept
                </span>
              )}
            </div>
          </div>
        </Card>
        {children.map((child) => renderDepartment(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Departments</h1>
            <p className="text-sm text-muted-foreground">
              {departments.length} departments
            </p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Department
        </Button>
      </div>

      {/* Department Tree */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 h-16 animate-pulse bg-muted" />
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg">No departments yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first department to organize your team
          </p>
        </Card>
      ) : (
        <div>{topLevel.map((dept) => renderDepartment(dept))}</div>
      )}
    </div>
  );
}
