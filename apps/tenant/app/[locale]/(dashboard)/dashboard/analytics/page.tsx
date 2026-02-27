import { BarChart3 } from 'lucide-react';

export default function AnalyticsDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-16 text-center">
        <div className="mb-4 rounded-full bg-blue-50 dark:bg-blue-900/30 p-4">
          <BarChart3 className="h-10 w-10 text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Analytics Coming Soon
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          Real-time analytics with tenant activity metrics, user growth charts, and customizable
          date ranges will be available in a future release.
        </p>
      </div>
    </div>
  );
}
