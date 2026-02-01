import { useQuery } from '@tanstack/react-query';
import { fetchOrders, fetchOrder, fetchOrderTimeline, OrdersFilters } from '@/api/orders';

export function useOrdersQuery(filters: OrdersFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => fetchOrders(filters)
  });
}

export function useOrderQuery(id?: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id as string),
    enabled: Boolean(id)
  });
}

export function useOrderTimelineQuery(id?: string) {
  return useQuery({
    queryKey: ['order-timeline', id],
    queryFn: () => fetchOrderTimeline(id as string),
    enabled: Boolean(id)
  });
}
