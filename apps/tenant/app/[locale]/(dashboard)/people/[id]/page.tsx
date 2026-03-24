'use client';

import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card, Tabs, TabsContent, TabsList, TabsTrigger } from '@kaven/ui-base';
import { ArrowLeft, User, Briefcase, Building2, Calendar, Mail } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { OneOnOneCard } from '@/components/people/OneOnOneCard';
import type { PerformanceReview, OneOnOne } from '@/types/people';

export default function EmployeeDetailPage() {
  const { tenant } = useTenant();
  const router = useRouter();
  const params = useParams();
  const employeeId = params?.id as string;

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () =>
      api.get(`/api/v1/people/employees/${employeeId}`).then((r) => r.data),
    enabled: !!tenant?.id && !!employeeId,
  });

  const { data: oneOnOnes } = useQuery({
    queryKey: ['one-on-ones', employeeId],
    queryFn: () =>
      api.get('/api/v1/people/one-on-ones', {
        params: { employeeId, limit: 10 },
      }).then((r) => r.data),
    enabled: !!tenant?.id && !!employeeId,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', employeeId],
    queryFn: () =>
      api.get('/api/v1/people/reviews', {
        params: { revieweeId: employeeId, limit: 10 },
      }).then((r) => r.data),
    enabled: !!tenant?.id && !!employeeId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6 h-48 animate-pulse bg-muted" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Employee not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{employee.fullName}</h1>
          <p className="text-sm text-muted-foreground">
            {employee.jobTitle} - {employee.department?.name}
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Status:</span>
              <span>{employee.status}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Type:</span>
              <span>{employee.employmentType}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Department:</span>
              <span>{employee.department?.name}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Hire Date:</span>
              <span>{formatDate(employee.hireDate)}</span>
            </div>
            {employee.manager && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Manager:</span>
                <span>{employee.manager.fullName}</span>
              </div>
            )}
            {employee.jobLevel && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Level:</span>
                <span>{employee.jobLevel}</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {employee.user?.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Email:</span>
                <span className="truncate">{employee.user.email}</span>
              </div>
            )}
            {employee.directReports && employee.directReports.length > 0 && (
              <div className="text-sm">
                <span className="font-medium">{employee.directReports.length} Direct Reports</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="one-on-ones">1:1 Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-4">
          {reviews?.data?.length > 0 ? (
            <div className="space-y-3">
              {reviews.data.map((review: PerformanceReview) => (
                <Card key={review.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">{review.reviewType} Review</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.periodStart)} - {formatDate(review.periodEnd)}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-muted">
                      {review.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {review.finalScore && (
                    <p className="text-sm mt-2">
                      Final: {review.finalScore.replace(/_/g, ' ')}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No reviews yet</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="one-on-ones" className="mt-4">
          {oneOnOnes?.data?.length > 0 ? (
            <div className="space-y-3">
              {oneOnOnes.data.map((meeting: OneOnOne) => (
                <OneOnOneCard key={meeting.id} oneOnOne={meeting} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No 1:1 meetings yet</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
