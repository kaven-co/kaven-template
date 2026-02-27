import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary, getDashboardCharts, getDashboardDistribution } from '@/lib/api/dashboard';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: getDashboardSummary,
    staleTime: 1000 * 60 * 5,
  });
};

export const useDashboardCharts = () => {
  return useQuery({
    queryKey: ['dashboard', 'charts'],
    queryFn: getDashboardCharts,
    staleTime: 1000 * 60 * 5,
  });
};

export const useDashboardDistribution = () => {
  return useQuery({
    queryKey: ['dashboard', 'distribution'],
    queryFn: getDashboardDistribution,
    staleTime: 1000 * 60 * 5,
  });
};
