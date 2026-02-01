import { useQueries } from '@tanstack/react-query';
import { fetchOrdersByFamily, fetchStatisticsKpis, fetchSectorOverview, fetchTrends } from '@/api/statistics';

export function useStatisticsQuery(range?: { from?: string; to?: string }) {
  const results = useQueries({
    queries: [
      {
        queryKey: ['statistics', 'kpis', range],
        queryFn: () => fetchStatisticsKpis(range)
      },
      {
        queryKey: ['statistics', 'sectors', range],
        queryFn: () => fetchSectorOverview(range)
      },
      {
        queryKey: ['statistics', 'trends', range],
        queryFn: () => fetchTrends('orders', range)
      },
      {
        queryKey: ['statistics', 'by-family'],
        queryFn: fetchOrdersByFamily
      }
    ]
  });

  return {
    kpis: results[0],
    sectors: results[1],
    trends: results[2],
    byFamily: results[3]
  };
}
