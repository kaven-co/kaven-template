'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Badge,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kaven/ui-base';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  MessageSquare,
  Activity,
  Star,
  Send,
  UserCheck,
  ArrowUpDown,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { LifecycleBadge } from '@/components/clients/LifecycleBadge';
import { HealthIndicator } from '@/components/clients/HealthIndicator';
import { TimelineItem } from '@/components/clients/TimelineItem';
import { InteractionForm } from '@/components/clients/InteractionForm';
import { TagManager } from '@/components/clients/TagManager';
import type {
  Contact,
  TimelineEvent,
  CrmInteraction,
  CustomerFeedback,
  HealthScore,
  LifecycleStage,
} from '@/types/clients';

type TabId = 'overview' | 'timeline' | 'interactions' | 'feedback';

const lifecycleOptions: LifecycleStage[] = [
  'LEAD', 'MQL', 'SQL', 'OPPORTUNITY', 'ACTIVE_CLIENT', 'AT_RISK', 'CHURNED', 'ADVOCATE',
];

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const contactId = params?.id as string;

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [interactionOpen, setInteractionOpen] = useState(false);
  const [lifecycleOpen, setLifecycleOpen] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [surveyType, setSurveyType] = useState('NPS');

  // Fetch contact
  const { data: contact, isLoading } = useQuery<Contact>({
    queryKey: ['contact', contactId, tenant?.id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/clients/contacts/${contactId}`);
      return res.data?.data || res.data;
    },
    enabled: !!tenant?.id && !!contactId,
  });

  // Fetch health score
  const { data: healthScore } = useQuery<HealthScore>({
    queryKey: ['health-score', contactId, tenant?.id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/clients/contacts/${contactId}/health`);
      return res.data?.data || res.data;
    },
    enabled: !!tenant?.id && !!contactId,
  });

  // Fetch timeline
  const { data: timeline } = useQuery<TimelineEvent[]>({
    queryKey: ['timeline', contactId, tenant?.id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/clients/contacts/${contactId}/timeline`);
      return res.data?.data || [];
    },
    enabled: !!tenant?.id && !!contactId && activeTab === 'timeline',
  });

  // Fetch interactions
  const { data: interactions } = useQuery<CrmInteraction[]>({
    queryKey: ['interactions', contactId, tenant?.id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/clients/contacts/${contactId}/interactions`);
      return res.data?.data || [];
    },
    enabled: !!tenant?.id && !!contactId && activeTab === 'interactions',
  });

  // Fetch feedback
  const { data: feedback } = useQuery<CustomerFeedback[]>({
    queryKey: ['feedback', contactId, tenant?.id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/clients/contacts/${contactId}/feedback`);
      return res.data?.data || [];
    },
    enabled: !!tenant?.id && !!contactId && activeTab === 'feedback',
  });

  // Update lifecycle mutation
  const updateLifecycleMutation = useMutation({
    mutationFn: async (stage: string) => {
      const res = await api.patch(`/api/v1/clients/contacts/${contactId}`, {
        lifecycleStage: stage,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      setLifecycleOpen(false);
      toast.success('Lifecycle stage updated');
    },
    onError: () => {
      toast.error('Failed to update lifecycle stage');
    },
  });

  // Send survey mutation
  const sendSurveyMutation = useMutation({
    mutationFn: async (data: { feedbackType: string }) => {
      const res = await api.post(`/api/v1/clients/contacts/${contactId}/feedback/send`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', contactId] });
      setSurveyOpen(false);
      toast.success('Survey sent successfully');
    },
    onError: () => {
      toast.error('Failed to send survey');
    },
  });

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'interactions', label: 'Interactions', icon: MessageSquare },
    { id: 'feedback', label: 'Feedback', icon: Star },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-muted/50 animate-pulse rounded" />
        <div className="h-32 bg-muted/50 animate-pulse rounded-xl" />
        <div className="h-64 bg-muted/50 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
        <p className="text-lg font-medium">Contact not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/clients')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Contacts
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/clients')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Contacts</span>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {contact.avatarUrl ? (
                <img
                  src={contact.avatarUrl}
                  alt={contact.fullName}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
                  {contact.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{contact.fullName}</h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  {contact.organization && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {contact.organization.name}
                    </span>
                  )}
                  {contact.jobTitle && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {contact.jobTitle}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LifecycleBadge stage={contact.lifecycleStage} />
              {healthScore && (
                <HealthIndicator
                  score={healthScore.overallScore}
                  category={healthScore.category}
                  showLabel
                />
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-4 border-b -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 p-4">
          {activeTab === 'overview' && (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Contact info */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Contact Information</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${contact.email}`} className="hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.source && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Source: </span>
                      <span>{contact.source}</span>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-muted-foreground">Type: </span>
                    <span className="capitalize">{contact.contactType.toLowerCase()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Created: </span>
                    <span>{format(new Date(contact.createdAt), 'PPP')}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Organization */}
              {contact.organization && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Organization</h3>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={`/clients/organizations`}
                      className="flex items-center gap-2 text-sm hover:underline"
                    >
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {contact.organization.name}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Scores */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Scores</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lead Score</span>
                    <span className="font-medium">{contact.leadScore ?? '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">NPS Score</span>
                    <span className="font-medium">{contact.npsScore ?? '-'}</span>
                  </div>
                  {healthScore && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Health</span>
                      <HealthIndicator
                        score={healthScore.overallScore}
                        category={healthScore.category}
                        showLabel
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Custom fields */}
              {contact.customFields && Object.keys(contact.customFields).length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Custom Fields</h3>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(contact.customFields).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <h3 className="font-semibold">Tags</h3>
                </CardHeader>
                <CardContent>
                  <TagManager contactId={contactId} tags={contact.tags} />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="max-w-2xl">
              {!timeline || timeline.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Calendar className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-lg font-medium">No timeline events</p>
                  <p className="text-sm mt-1">
                    Interactions and activities will appear here.
                  </p>
                </div>
              ) : (
                <div>
                  {timeline.map((event) => (
                    <TimelineItem key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'interactions' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Interaction History</h3>
                <Button variant="outline" onClick={() => setInteractionOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Log Interaction
                </Button>
              </div>
              {!interactions || interactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-lg font-medium">No interactions yet</p>
                  <p className="text-sm mt-1">Log your first interaction with this contact.</p>
                  <Button className="mt-4" onClick={() => setInteractionOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Log Interaction
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {interactions.map((interaction) => (
                    <Card key={interaction.id}>
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {interaction.type}
                              </Badge>
                              {interaction.channel && (
                                <Badge variant="secondary">
                                  {interaction.channel}
                                </Badge>
                              )}
                              {interaction.direction && (
                                <span className="text-xs text-muted-foreground capitalize">
                                  {interaction.direction.toLowerCase()}
                                </span>
                              )}
                            </div>
                            {interaction.subject && (
                              <p className="text-sm font-medium mt-1">{interaction.subject}</p>
                            )}
                            {interaction.body && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {interaction.body}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-xs text-muted-foreground shrink-0 ml-4">
                            <p>{format(new Date(interaction.occurredAt), 'PP')}</p>
                            <p>{format(new Date(interaction.occurredAt), 'p')}</p>
                            {interaction.user && (
                              <p className="mt-1">{interaction.user.name}</p>
                            )}
                          </div>
                        </div>
                        {interaction.outcome && (
                          <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                            Outcome: {interaction.outcome}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Feedback History</h3>
                <Button variant="outline" onClick={() => setSurveyOpen(true)}>
                  <Send className="mr-2 h-4 w-4" /> Send Survey
                </Button>
              </div>
              {!feedback || feedback.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Star className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-lg font-medium">No feedback collected</p>
                  <p className="text-sm mt-1">Send a survey to collect NPS or CSAT scores.</p>
                  <Button className="mt-4" onClick={() => setSurveyOpen(true)}>
                    <Send className="mr-2 h-4 w-4" /> Send Survey
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedback.map((fb) => (
                    <Card key={fb.id}>
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge variant="outline">{fb.feedbackType}</Badge>
                            {fb.score != null && (
                              <span className="ml-2 text-sm font-semibold">
                                {fb.score}/10
                              </span>
                            )}
                            {fb.comment && (
                              <p className="text-sm text-muted-foreground mt-2">
                                &ldquo;{fb.comment}&rdquo;
                              </p>
                            )}
                          </div>
                          {fb.submittedAt && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(fb.submittedAt), 'PP')}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar — Quick actions */}
      <div className="w-64 border-l p-4 space-y-4 hidden lg:block">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </h4>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setLifecycleOpen(true)}
        >
          <ArrowUpDown className="mr-2 h-4 w-4" /> Change Lifecycle
        </Button>

        <Button variant="outline" className="w-full justify-start" disabled>
          <UserCheck className="mr-2 h-4 w-4" /> Assign To
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setInteractionOpen(true)}
        >
          <MessageSquare className="mr-2 h-4 w-4" /> Log Interaction
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setSurveyOpen(true)}
        >
          <Send className="mr-2 h-4 w-4" /> Send Survey
        </Button>

        {/* Assigned to */}
        {contact.assignedTo && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-1">Assigned to</p>
            <p className="text-sm font-medium">{contact.assignedTo.name}</p>
          </div>
        )}

        {/* Stats */}
        <div className="pt-4 border-t space-y-2">
          <p className="text-xs text-muted-foreground">Interactions</p>
          <p className="text-lg font-semibold">{contact._count?.interactions ?? 0}</p>
        </div>
      </div>

      {/* Interaction Form Dialog */}
      <InteractionForm
        contactId={contactId}
        open={interactionOpen}
        onOpenChange={setInteractionOpen}
      />

      {/* Lifecycle Change Dialog */}
      <Dialog open={lifecycleOpen} onOpenChange={setLifecycleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Lifecycle Stage</DialogTitle>
            <DialogDescription>
              Select the new lifecycle stage for {contact.fullName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {lifecycleOptions.map((stage) => (
              <Button
                key={stage}
                variant={contact.lifecycleStage === stage ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => updateLifecycleMutation.mutate(stage)}
                disabled={updateLifecycleMutation.isPending}
              >
                {stage.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Survey Dialog */}
      <Dialog open={surveyOpen} onOpenChange={setSurveyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Survey</DialogTitle>
            <DialogDescription>
              Send a feedback survey to {contact.fullName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Survey Type</Label>
              <select
                value={surveyType}
                onChange={(e) => setSurveyType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="NPS">NPS (Net Promoter Score)</option>
                <option value="CSAT">CSAT (Customer Satisfaction)</option>
                <option value="CES">CES (Customer Effort Score)</option>
              </select>
            </div>
            <DialogFooter>
              <Button
                onClick={() => sendSurveyMutation.mutate({ feedbackType: surveyType })}
                disabled={sendSurveyMutation.isPending}
              >
                {sendSurveyMutation.isPending ? 'Sending...' : 'Send Survey'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
