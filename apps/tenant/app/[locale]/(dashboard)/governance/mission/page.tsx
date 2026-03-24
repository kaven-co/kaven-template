'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  Input,
  Label,
} from '@kaven/ui-base';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { MissionDisplay } from '@/components/governance/MissionDisplay';
import type { MissionStatement, StrategicPillar } from '@/types/governance';

export default function MissionPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    mission: '',
    vision: '',
    purpose: '',
    values: [''],
  });

  // Fetch mission
  const { data: mission } = useQuery({
    queryKey: ['governance', 'mission', tenant?.id],
    queryFn: () => api.get('/api/v1/governance/mission').then((r) => r.data as MissionStatement),
    enabled: !!tenant?.id,
  });

  // Fetch pillars
  const { data: pillars } = useQuery({
    queryKey: ['governance', 'pillars', tenant?.id],
    queryFn: () => api.get('/api/v1/governance/pillars').then((r) => r.data as StrategicPillar[]),
    enabled: !!tenant?.id,
  });

  // Save mission
  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.put('/api/v1/governance/mission', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance', 'mission'] });
      setIsEditing(false);
      toast.success('Mission statement saved');
    },
    onError: () => {
      toast.error('Failed to save mission statement');
    },
  });

  const startEditing = () => {
    setFormData({
      mission: mission?.mission || '',
      vision: mission?.vision || '',
      purpose: mission?.purpose || '',
      values: mission?.values?.length ? [...mission.values] : [''],
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      mission: formData.mission || undefined,
      vision: formData.vision || undefined,
      purpose: formData.purpose || undefined,
      values: formData.values.filter(Boolean),
    });
  };

  const addValue = () => setFormData((prev) => ({ ...prev, values: [...prev.values, ''] }));
  const removeValue = (idx: number) => setFormData((prev) => ({ ...prev, values: prev.values.filter((_, i) => i !== idx) }));
  const updateValue = (idx: number, val: string) => {
    const newValues = [...formData.values];
    newValues[idx] = val;
    setFormData((prev) => ({ ...prev, values: newValues }));
  };

  const horizonColors: Record<string, string> = {
    SHORT_TERM: 'border-l-green-500',
    MID_TERM: 'border-l-blue-500',
    LONG_TERM: 'border-l-purple-500',
  };

  const horizonLabels: Record<string, string> = {
    SHORT_TERM: 'Short Term',
    MID_TERM: 'Mid Term',
    LONG_TERM: 'Long Term',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mission & Strategy</h1>
          <p className="text-muted-foreground">Company mission, vision, values, and strategic pillars</p>
        </div>
        {!isEditing && (
          <Button variant="outline" onClick={startEditing}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Mission
          </Button>
        )}
      </div>

      {/* Mission Statement */}
      {isEditing ? (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Edit Mission Statement</h2>

          <div>
            <Label htmlFor="mission">Mission</Label>
            <textarea
              id="mission"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none mt-1"
              placeholder="What is your company's mission?"
              value={formData.mission}
              onChange={(e) => setFormData((prev) => ({ ...prev, mission: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="vision">Vision</Label>
            <textarea
              id="vision"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none mt-1"
              placeholder="What future are you building towards?"
              value={formData.vision}
              onChange={(e) => setFormData((prev) => ({ ...prev, vision: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <textarea
              id="purpose"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none mt-1"
              placeholder="Why does your company exist?"
              value={formData.purpose}
              onChange={(e) => setFormData((prev) => ({ ...prev, purpose: e.target.value }))}
            />
          </div>

          <div>
            <Label>Values</Label>
            <div className="space-y-2 mt-1">
              {formData.values.map((val, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={val}
                    onChange={(e) => updateValue(idx, e.target.value)}
                    placeholder={`Value ${idx + 1}`}
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeValue(idx)} disabled={formData.values.length <= 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addValue}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Value
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <MissionDisplay mission={mission || {}} />
      )}

      {/* Strategic Pillars */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Strategic Pillars</h2>
          <Button variant="outline" size="sm">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Pillar
          </Button>
        </div>

        {!pillars || pillars.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No strategic pillars defined. Add pillars to organize your company strategy.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <Card
                key={pillar.id}
                className={`p-4 border-l-4 ${horizonColors[pillar.horizon] || 'border-l-gray-500'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{pillar.title}</h3>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {horizonLabels[pillar.horizon]}
                  </span>
                </div>
                {pillar.description && (
                  <p className="text-xs text-muted-foreground line-clamp-3">{pillar.description}</p>
                )}
                {pillar.owner && (
                  <p className="text-xs text-muted-foreground mt-2">{pillar.owner.name}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
