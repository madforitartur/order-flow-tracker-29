// Order Management System Types

export interface Order {
  id: string;
  nrDocumento: string;
  terceiro: string; // Client code/name
  dataEmissao: Date;
  dataPedida: Date;
  item: number;
  po: string; // Purchase Order
  codArtigo: string;
  referencia: string;
  cor: string;
  descricaoCor: string;
  tam: string; // Size
  familia: string;
  descricaoTam: string;
  ean: string;
  qtdPedida: number;
  
  // Production sector data
  dataTec: Date | null;
  felpoCru: number;
  dataFelpoCru: Date | null;
  tinturaria: number;
  dataTint: Date | null;
  confeccaoRoupoes: number;
  confeccaoFelpos: number;
  dataConf: Date | null;
  embAcab: number;
  dataArmExp: Date | null;
  stockCx: number;
  dataEnt: Date | null;
  
  // Special dates
  dataEspecial: Date | null;
  dataPrinter: Date | null;
  dataDebuxo: Date | null;
  dataAmostras: Date | null;
  dataBordados: Date | null;
  
  // Final quantities
  facturada: number;
  emAberto: number;
}

export type OrderStatus = 'completed' | 'in-progress' | 'delayed' | 'pending';

export interface SectorStatus {
  sector: ProductionSector;
  quantity: number;
  date: Date | null;
  status: 'completed' | 'in-progress' | 'pending';
}

export type ProductionSector = 
  | 'tecelagem'
  | 'felpo-cru'
  | 'tinturaria'
  | 'confeccao'
  | 'embalagem'
  | 'expedicao';

export const SECTOR_LABELS: Record<ProductionSector, string> = {
  'tecelagem': 'Tecelagem',
  'felpo-cru': 'Felpo Cru',
  'tinturaria': 'Tinturaria',
  'confeccao': 'Confecção',
  'embalagem': 'Embalagem/Acab.',
  'expedicao': 'Expedição'
};

export const SECTOR_COLORS: Record<ProductionSector, string> = {
  'tecelagem': 'hsl(200, 80%, 45%)',
  'felpo-cru': 'hsl(30, 90%, 55%)',
  'tinturaria': 'hsl(270, 60%, 50%)',
  'confeccao': 'hsl(340, 70%, 50%)',
  'embalagem': 'hsl(160, 60%, 40%)',
  'expedicao': 'hsl(220, 70%, 50%)'
};

export interface DashboardKPI {
  totalOrders: number;
  activeOrders: number;
  delayedOrders: number;
  completedThisMonth: number;
  dueThisWeek: number;
  dueThisMonth: number;
  totalQuantityInProduction: number;
  totalInvoiced: number;
  totalPending: number;
  fulfillmentRate: number;
}

export interface SectorMetrics {
  sector: ProductionSector;
  currentQuantity: number;
  orderCount: number;
  avgProcessingDays: number;
  occupancyRate: number;
}

export interface FilterState {
  client: string;
  documentNumber: string;
  po: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  dueDateFrom: Date | null;
  dueDateTo: Date | null;
  familia: string;
  referencia: string;
  status: OrderStatus | 'all';
  sector: ProductionSector | 'all';
}

export interface ImportLog {
  id: string;
  fileName: string;
  importDate: Date;
  recordCount: number;
  status: 'success' | 'error' | 'partial';
  errors?: string[];
}
