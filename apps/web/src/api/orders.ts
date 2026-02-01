import { ordersListSchema, orderDtoSchema, orderTimelineSchema } from '@order-flow/shared';
import { apiFetch } from './client';
import { mapOrder } from './mappers';
import type { Order } from '@/types/order';

export interface OrdersFilters {
  search?: string;
  status?: string;
  client?: string;
  family?: string;
  sector?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  direction?: string;
}

export async function fetchOrders(filters: OrdersFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.set(key, String(value));
    }
  });

  const response = await apiFetch(`/api/orders?${params.toString()}`, {}, ordersListSchema);
  return {
    ...response,
    data: response.data.map(mapOrder)
  };
}

export async function fetchOrder(id: string) {
  const response = await apiFetch(`/api/orders/${id}`, {}, orderDtoSchema);
  return mapOrder(response);
}

export async function fetchOrderTimeline(id: string) {
  return apiFetch(`/api/orders/${id}/timeline`, {}, orderTimelineSchema);
}
