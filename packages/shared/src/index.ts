import { z } from 'zod';

export const orderDtoSchema = z.object({
  id: z.string(),
  nrDocumento: z.string(),
  terceiro: z.string(),
  dataEmissao: z.string().nullable(),
  dataPedida: z.string().nullable(),
  item: z.number(),
  po: z.string(),
  codArtigo: z.string(),
  referencia: z.string(),
  cor: z.string(),
  descricaoCor: z.string(),
  tam: z.string(),
  familia: z.string(),
  descricaoTam: z.string(),
  ean: z.string(),
  qtdPedida: z.number(),
  dataTec: z.string().nullable(),
  felpoCru: z.number(),
  dataFelpoCru: z.string().nullable(),
  tinturaria: z.number(),
  dataTint: z.string().nullable(),
  confeccaoRoupoes: z.number(),
  confeccaoFelpos: z.number(),
  dataConf: z.string().nullable(),
  embAcab: z.number(),
  dataArmExp: z.string().nullable(),
  stockCx: z.number(),
  dataEnt: z.string().nullable(),
  dataEspecial: z.string().nullable(),
  dataPrinter: z.string().nullable(),
  dataDebuxo: z.string().nullable(),
  dataAmostras: z.string().nullable(),
  dataBordados: z.string().nullable(),
  facturada: z.number(),
  emAberto: z.number()
});

export type OrderDTO = z.infer<typeof orderDtoSchema>;

export const ordersListSchema = z.object({
  data: z.array(orderDtoSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number()
});

export type OrdersListResponse = z.infer<typeof ordersListSchema>;

export const timelineStatusSchema = z.object({
  id: z.string(),
  status: z.string(),
  statusReason: z.string().nullable(),
  updatedAt: z.string(),
  updatedBy: z.string().nullable()
});

export const timelineSectorSchema = z.object({
  id: z.string(),
  sectorId: z.string(),
  sectorCode: z.string(),
  sectorName: z.string(),
  state: z.string(),
  startDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  endDate: z.string().nullable(),
  notes: z.string().nullable(),
  updatedAt: z.string(),
  updatedBy: z.string().nullable()
});

export const orderTimelineSchema = z.object({
  orderId: z.string(),
  statusHistory: z.array(timelineStatusSchema),
  sectorHistory: z.array(timelineSectorSchema)
});

export type OrderTimelineResponse = z.infer<typeof orderTimelineSchema>;

export const dashboardKpiSchema = z.object({
  totalOrders: z.number(),
  activeOrders: z.number(),
  delayedOrders: z.number(),
  completedThisMonth: z.number(),
  dueThisWeek: z.number(),
  dueThisMonth: z.number(),
  totalQuantityInProduction: z.number(),
  totalInvoiced: z.number(),
  totalPending: z.number(),
  fulfillmentRate: z.number()
});

export type DashboardKPIResponse = z.infer<typeof dashboardKpiSchema>;

export const dashboardByClientSchema = z.array(z.object({
  clientName: z.string(),
  orderCount: z.number(),
  totalQuantity: z.number()
}));

export type DashboardByClientResponse = z.infer<typeof dashboardByClientSchema>;

export const dashboardByStatusSchema = z.array(z.object({
  status: z.string(),
  count: z.number()
}));

export type DashboardByStatusResponse = z.infer<typeof dashboardByStatusSchema>;

export const sectorOverviewSchema = z.array(z.object({
  sector: z.string(),
  currentQuantity: z.number(),
  orderCount: z.number(),
  avgProcessingDays: z.number(),
  occupancyRate: z.number()
}));

export type SectorOverviewResponse = z.infer<typeof sectorOverviewSchema>;

export const alertsSchema = z.array(z.object({
  id: z.string(),
  type: z.string(),
  severity: z.string(),
  orderId: z.string().nullable(),
  sectorId: z.string().nullable(),
  message: z.string(),
  createdAt: z.string(),
  resolvedAt: z.string().nullable(),
  orderDocument: z.string().nullable(),
  clientName: z.string().nullable(),
  dueDate: z.string().nullable(),
  openQuantity: z.number().nullable()
}));

export type AlertsResponse = z.infer<typeof alertsSchema>;

export const importLogSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  importDate: z.string(),
  recordCount: z.number(),
  status: z.enum(['success', 'error', 'partial', 'processing', 'duplicate']),
  errors: z.array(z.string()).optional()
});

export const importLogsSchema = z.array(importLogSchema);
export type ImportLogResponse = z.infer<typeof importLogSchema>;

export const importDetailSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  importDate: z.string(),
  recordCount: z.number(),
  status: z.string(),
  errors: z.array(z.string()).optional()
});

export type ImportDetailResponse = z.infer<typeof importDetailSchema>;

export const trendsSchema = z.array(z.object({
  date: z.string(),
  value: z.number()
}));

export type TrendsResponse = z.infer<typeof trendsSchema>;

export const ordersByFamilySchema = z.array(z.object({
  family: z.string(),
  orderCount: z.number(),
  totalQuantity: z.number()
}));

export type OrdersByFamilyResponse = z.infer<typeof ordersByFamilySchema>;
