'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@kaven/ui-base';
import {
  ArrowLeft,
  Users,
  Target,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { TaskCard } from '@/components/projects/TaskCard';
import { MilestoneProgress } from '@/components/projects/MilestoneProgress';
import { MemberAvatar } from '@/components/projects/MemberAvatar';
import type { Project, Task, Milestone, ProjectMember } from '@/types/projects';

const statusColors: Record<string, string> = {
  PLANNING: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
  ARCHIVED: 'bg-gray-200 text-gray-600',
};

const COLUMNS = [
  { id: 'BACKLOG', label: 'Backlog' },
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'IN_REVIEW', label: 'In Review' },
  { id: 'DONE', label: 'Done' },
] as const;

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id ?? '') as string;

  // Fetch project
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/projects/${projectId}`);
      return res.data as Project;
    },
    enabled: !!projectId,
  });

  // Fetch tasks
  const { data: tasksData } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/projects/${projectId}/tasks`, {
        params: { limit: 100 },
      });
      return res.data;
    },
    enabled: !!projectId,
  });

  // Fetch milestones
  const { data: milestones } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/projects/${projectId}/milestones`);
      return res.data as Milestone[];
    },
    enabled: !!projectId,
  });

  // Fetch members
  const { data: members } = useQuery({
    queryKey: ['members', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/projects/${projectId}/members`);
      return res.data as ProjectMember[];
    },
    enabled: !!projectId,
  });

  // Delete project
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/v1/projects/${projectId}`);
    },
    onSuccess: () => {
      toast.success('Project deleted');
      router.push('/projects');
    },
    onError: () => toast.error('Failed to delete project'),
  });

  const tasks: Task[] = tasksData?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
        <p className="text-lg font-medium">Project not found</p>
        <Button onClick={() => router.push('/projects')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.max(0, project.progress));

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: project.color || '#3B82F6' }}
              />
              <h1 className="text-2xl font-bold">{project.name}</h1>
              {project.code && (
                <span className="text-sm text-muted-foreground">{project.code}</span>
              )}
              <Badge className={statusColors[project.status]}>
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {project.description || 'No description'}
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (confirm('Delete this project?')) deleteMutation.mutate();
          }}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Progress</div>
          <div className="text-2xl font-bold">{Math.round(progressPercent)}%</div>
          <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
            <div className="bg-primary rounded-full h-1.5" style={{ width: `${progressPercent}%` }} />
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Tasks</div>
          <div className="text-2xl font-bold">{project._count?.tasks || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Hours Logged</div>
          <div className="text-2xl font-bold">{project.hoursLogged}h</div>
          {project.hoursEstimated && (
            <div className="text-xs text-muted-foreground">/ {project.hoursEstimated}h est.</div>
          )}
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Cost</div>
          <div className="text-2xl font-bold">
            {project.currency} {project.costIncurred.toLocaleString()}
          </div>
          {project.budgetAmount && (
            <div className="text-xs text-muted-foreground">/ {project.budgetAmount.toLocaleString()} budget</div>
          )}
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Team</div>
          <div className="text-2xl font-bold">{project._count?.members || 0}</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* Tasks Tab - Kanban Board */}
        <TabsContent value="tasks" className="mt-4">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((column) => {
              const columnTasks = tasks.filter((t) => t.status === column.id);
              return (
                <div key={column.id} className="flex-shrink-0 w-72">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm">{column.label}</h3>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {columnTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    {columnTasks.length === 0 && (
                      <div className="p-4 border-2 border-dashed rounded-lg text-center text-xs text-muted-foreground">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="mt-4">
          <div className="space-y-4">
            {milestones && milestones.length > 0 ? (
              milestones.map((ms) => (
                <MilestoneProgress key={ms.id} milestone={ms} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No milestones yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members && members.length > 0 ? (
              members.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <MemberAvatar
                      name={member.user.name}
                      avatar={member.user.avatar}
                      size="lg"
                    />
                    <div>
                      <h4 className="font-medium">{member.user.name}</h4>
                      <p className="text-xs text-muted-foreground">{member.user.email}</p>
                      <Badge className="mt-1 text-[10px]">{member.role}</Badge>
                    </div>
                  </div>
                  {member.hourlyRate && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Rate: ${member.hourlyRate}/hr
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No team members</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
