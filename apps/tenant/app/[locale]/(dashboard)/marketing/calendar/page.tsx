'use client';

import { useState } from 'react';
import { Card, Button } from '@kaven/ui-base';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChannelBadge } from '@/components/marketing/ChannelBadge';

interface CalendarEntry {
  id: string;
  title: string;
  type: string;
  scheduledAt: string;
  endAt?: string;
  channel?: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';
  status: string;
  color?: string;
  campaign?: { id: string; name: string };
}

const demoEntries: CalendarEntry[] = [
  {
    id: '1',
    title: 'Product Launch Campaign',
    type: 'campaign',
    scheduledAt: '2026-04-15T10:00:00Z',
    endAt: '2026-04-15T18:00:00Z',
    channel: 'EMAIL',
    status: 'scheduled',
    color: '#f59e0b',
    campaign: { id: '2', name: 'Product Launch 2026' },
  },
  {
    id: '2',
    title: 'Monthly Webinar — SaaS Growth',
    type: 'event',
    scheduledAt: '2026-04-20T14:00:00Z',
    endAt: '2026-04-20T15:30:00Z',
    status: 'scheduled',
    color: '#3b82f6',
  },
  {
    id: '3',
    title: 'Newsletter Send',
    type: 'campaign',
    scheduledAt: '2026-04-01T09:00:00Z',
    channel: 'EMAIL',
    status: 'completed',
    color: '#10b981',
  },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MarketingCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(3); // April (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getEntriesForDay = (day: number) => {
    return demoEntries.filter((entry) => {
      const entryDate = new Date(entry.scheduledAt);
      return (
        entryDate.getFullYear() === currentYear &&
        entryDate.getMonth() === currentMonth &&
        entryDate.getDate() === day
      );
    });
  };

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 border border-border/30" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const entries = getEntriesForDay(day);
    const isToday =
      day === new Date().getDate() &&
      currentMonth === new Date().getMonth() &&
      currentYear === new Date().getFullYear();

    days.push(
      <div key={day} className={`h-24 border border-border/30 p-1 ${isToday ? 'bg-amber-500/5' : ''}`}>
        <span className={`text-xs font-medium ${isToday ? 'text-amber-400' : 'text-muted-foreground'}`}>
          {day}
        </span>
        <div className="mt-1 space-y-0.5">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
              style={{ backgroundColor: `${entry.color}20`, color: entry.color || '#888' }}
            >
              {entry.title}
            </div>
          ))}
        </div>
      </div>,
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketing Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Schedule and visualize campaigns, events and content
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      <Card className="p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1 hover:bg-muted rounded">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button onClick={nextMonth} className="p-1 hover:bg-muted rounded">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0">{days}</div>
      </Card>

      {/* Upcoming entries */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Upcoming</h3>
        <div className="space-y-2">
          {demoEntries
            .filter((e) => e.status === 'scheduled')
            .map((entry) => (
              <Card key={entry.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: entry.color || '#888' }} />
                  <div>
                    <p className="font-medium text-sm">{entry.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.scheduledAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {entry.channel && <ChannelBadge channel={entry.channel} />}
                  <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-muted">{entry.type}</span>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
