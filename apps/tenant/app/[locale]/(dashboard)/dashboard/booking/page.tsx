import { CalendarCheck } from 'lucide-react';

export default function BookingDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Booking Dashboard</h1>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-16 text-center">
        <div className="mb-4 rounded-full bg-violet-50 dark:bg-violet-900/30 p-4">
          <CalendarCheck className="h-10 w-10 text-violet-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Booking Coming Soon
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          Appointment scheduling, booking management, and availability calendars
          will be available in a future release.
        </p>
      </div>
    </div>
  );
}
