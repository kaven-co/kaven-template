'use client';

import Image from 'next/image';
import { Card } from '@kaven/ui-base';
import { User, Briefcase, Building2 } from 'lucide-react';
import type { Employee, EmployeeStatus } from '@/types/people';

const statusColors: Record<EmployeeStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  ON_LEAVE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  SUSPENDED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  TERMINATED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  PROBATION: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

const statusLabels: Record<EmployeeStatus, string> = {
  ACTIVE: 'Active',
  ON_LEAVE: 'On Leave',
  SUSPENDED: 'Suspended',
  TERMINATED: 'Terminated',
  PROBATION: 'Probation',
};

interface EmployeeCardProps {
  employee: Employee;
  onClick?: () => void;
}

export function EmployeeCard({ employee, onClick }: EmployeeCardProps) {
  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
          {employee.user?.avatar ? (
            <Image
              src={employee.user.avatar}
              alt={employee.fullName}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-sm truncate">{employee.fullName}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[employee.status]}`}>
              {statusLabels[employee.status]}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Briefcase className="w-3 h-3" />
            <span className="truncate">{employee.jobTitle}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
            <Building2 className="w-3 h-3" />
            <span className="truncate">{employee.department?.name || 'No department'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
