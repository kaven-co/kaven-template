import { Landmark } from 'lucide-react';

export default function BankingDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Banking Dashboard</h1>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-16 text-center">
        <div className="mb-4 rounded-full bg-emerald-50 dark:bg-emerald-900/30 p-4">
          <Landmark className="h-10 w-10 text-emerald-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Banking Coming Soon
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          Revenue tracking with MRR/ARR metrics, subscription analytics, and payment history
          powered by real invoice data will be available in a future release.
        </p>
      </div>
    </div>
  );
}
