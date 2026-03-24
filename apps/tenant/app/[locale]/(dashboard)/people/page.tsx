'use client';

import { useState, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card, Input } from '@kaven/ui-base';
import { Plus, Search, Users, Building2, GitBranch } from 'lucide-react';
import { EmployeeCard } from '@/components/people/EmployeeCard';
import { useRouter } from 'next/navigation';
import type { Employee, EmployeeStatus } from '@/types/people';

type StatusFilter = 'ALL' | EmployeeStatus;

export default function PeoplePage() {
  const { tenant } = useTenant();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['employees', tenant?.id, deferredSearch, statusFilter],
    queryFn: () =>
      api.get('/api/v1/people/employees', {
        params: {
          search: deferredSearch || undefined,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          limit: 50,
        },
      }).then((r) => r.data),
    enabled: !!tenant?.id,
  });

  const employees: Employee[] = data?.data || [];
  const total = data?.meta?.total || 0;

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PROBATION', label: 'Probation' },
    { value: 'ON_LEAVE', label: 'On Leave' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'TERMINATED', label: 'Terminated' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">People</h1>
          <p className="text-sm text-muted-foreground">
            {total} employees in your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('./people/departments')}>
            <Building2 className="w-4 h-4 mr-2" />
            Departments
          </Button>
          <Button variant="outline" onClick={() => router.push('./people/hiring')}>
            <GitBranch className="w-4 h-4 mr-2" />
            Hiring
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {statusOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={statusFilter === opt.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Employee Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 h-24 animate-pulse bg-muted" />
          ))}
        </div>
      ) : employees.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg">No employees found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery
              ? 'Try a different search term'
              : 'Add your first employee to get started'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onClick={() => router.push(`./people/${emp.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
