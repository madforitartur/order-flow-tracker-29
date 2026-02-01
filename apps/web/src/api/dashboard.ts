import {
  dashboardKpiSchema,
  dashboardByClientSchema,
  dashboardByStatusSchema,
  sectorOverviewSchema,
  alertsSchema
} from '@order-flow/shared';
import { apiFetch } from './client';

export async function fetchDashboardKpis(range?: { from?: string; to?: string }) {
  const params = new URLSearchParams();
  if (range?.from) params.set('from', range.from);
  if (range?.to) params.set('to', range.to);
  return apiFetch(`/api/dashboard/kpis?${params.toString()}`, {}, dashboardKpiSchema);
}

export async function fetchDashboardByClient(range?: { from?: string; to?: string }) {
  const params = new URLSearchParams();
  if (range?.from) params.set('from', range.from);
  if (range?.to) params.set('to', range.to);
  return apiFetch(`/api/dashboard/by-client?${params.toString()}`, {}, dashboardByClientSchema);
}

export async function fetchDashboardByStatus(range?: { from?: string; to?: string }) {
  const params = new URLSearchParams();
  if (range?.from) params.set('from', range.from);
  if (range?.to) params.set('to', range.to);
  return apiFetch(`/api/dashboard/by-status?${params.toString()}`, {}, dashboardByStatusSchema);
}

export async function fetchDashboardSectors(range?: { from?: string; to?: string }) {
  const params = new URLSearchParams();
  if (range?.from) params.set('from', range.from);
  if (range?.to) params.set('to', range.to);
  return apiFetch(`/api/dashboard/sectors-overview?${params.toString()}`, {}, sectorOverviewSchema);
}

export async function fetchDashboardAlerts(range?: { from?: string; to?: string }) {
  const params = new URLSearchParams();
  if (range?.from) params.set('from', range.from);
  if (range?.to) params.set('to', range.to);
  return apiFetch(`/api/dashboard/alerts?${params.toString()}`, {}, alertsSchema);
}
