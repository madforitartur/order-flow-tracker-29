import type { Order } from '@/types/order';

export function getUniqueClients(orders: Order[]): string[] {
  return [...new Set(orders.map((o) => o.terceiro).filter(Boolean))].sort();
}

export function getUniqueFamilias(orders: Order[]): string[] {
  return [...new Set(orders.map((o) => o.familia).filter(Boolean))].sort();
}
