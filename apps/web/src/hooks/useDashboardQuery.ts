import { useQueries } from '@tanstack/react-query';
import {
  fetchDashboardKpis,
  fetchDashboardByClient,
  fetchDashboardByStatus,
  fetchDashboardSectors,
  fetchDashboardAlerts
} from '@/api/dashboard';

export function useDashboardQuery(range?: { from?: string; to?: string }) {
  const results = useQueries({
    queries: [
      {
        queryKey: ['dashboard', 'kpis', range],
        queryFn: () => fetchDashboardKpis(range)
      },
      {
        queryKey: ['dashboard', 'by-client', range],
        queryFn: () => fetchDashboardByClient(range)
      },
      {
        queryKey: ['dashboard', 'by-status', range],
        queryFn: () => fetchDashboardByStatus(range)
      },
      {
        queryKey: ['dashboard', 'sectors', range],
        queryFn: () => fetchDashboardSectors(range)
      },
      {
        queryKey: ['dashboard', 'alerts', range],
        queryFn: () => fetchDashboardAlerts(range)
      }
    ]
  });

  return {
    kpis: results[0],
    byClient: results[1],
    byStatus: results[2],
    sectors: results[3],
    alerts: results[4]
  };
}
