import { ordersByFamilySchema, trendsSchema, dashboardKpiSchema, sectorOverviewSchema } from '@order-flow/shared';
import { apiFetch } from './client';

export async function fetchTrends(metric: string, range?: { from?: string; to?: string }) {
  const params = new URLSearchParams();
  params.set('metric', metric);
  if (range?.from) params.set('from', range.from);
  if (range?.to) params.set('to', range.to);
  return apiFetch(`/api/statistics/trends?${params.toString()}`, {}, trendsSchema);
}

export async function fetchOrdersByFamily() {
  return apiFetch('/api/statistics/by-family', {}, ordersByFamilySchema);
}

export async function fetchStatisticsKpis(range?: { from?: string; to?: string }) {
  const params = new URLSearchParams();
  if (range?.from) params.set('from', range.from);
  if (range?.to) params.set('to', range.to);
  return apiFetch(`/api/dashboard/kpis?${params.toString()}`, {}, dashboardKpiSchema);
}

export async function fetchSectorOverview(range?: { from?: string; to?: string }) {
  const params = new URLSearchParams();
  if (range?.from) params.set('from', range.from);
  if (range?.to) params.set('to', range.to);
  return apiFetch(`/api/dashboard/sectors-overview?${params.toString()}`, {}, sectorOverviewSchema);
}
