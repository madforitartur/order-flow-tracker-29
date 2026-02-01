import { Order, DashboardKPI, SectorMetrics, ImportLog, ProductionSector } from '@/types/order';

// Sample clients
const clients = [
  'ACL IMPE', 'TEXTIL NORTE', 'CASA DO BANHO', 'HOTEL PREMIUM', 
  'RESIDENCIAL CONFORT', 'EXPORTADORA SUL', 'DISTRIB. CENTRO',
  'HOTELARIA GLOBAL', 'TÊXTEIS PORTUGAL', 'LUXURY LINENS'
];

const familias = ['TOALHA', 'ROUPÃO', 'FELPO', 'ATOALHADO', 'BANHO', 'PRAIA'];
const cores = ['BRANCO', 'AZUL', 'BEGE', 'CINZA', 'VERDE', 'BORDEAUX', 'PRETO'];
const tamanhos = ['S', 'M', 'L', 'XL', 'XXL', '50x100', '70x140', '100x150'];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateOrder(index: number): Order {
  const emissao = randomDate(new Date('2024-10-01'), new Date('2025-01-15'));
  const pedida = randomDate(new Date('2025-01-20'), new Date('2025-03-30'));
  const qtdPedida = Math.floor(Math.random() * 500) + 50;
  
  // Simulate production progress
  const progress = Math.random();
  const hoje = new Date();
  
  let felpoCru = 0, tinturaria = 0, confeccaoRoupoes = 0, confeccaoFelpos = 0, embAcab = 0, stockCx = 0, facturada = 0;
  let dataFelpoCru = null, dataTint = null, dataConf = null, dataArmExp = null, dataEnt = null;
  
  if (progress > 0.1) {
    felpoCru = Math.floor(qtdPedida * Math.min(1, progress * 1.2));
    dataFelpoCru = randomDate(emissao, hoje);
  }
  if (progress > 0.25) {
    tinturaria = Math.floor(felpoCru * Math.min(1, (progress - 0.15) * 1.3));
    dataTint = dataFelpoCru ? randomDate(dataFelpoCru, hoje) : null;
  }
  if (progress > 0.4) {
    const isRoupao = Math.random() > 0.5;
    if (isRoupao) {
      confeccaoRoupoes = Math.floor(tinturaria * Math.min(1, (progress - 0.3) * 1.4));
    } else {
      confeccaoFelpos = Math.floor(tinturaria * Math.min(1, (progress - 0.3) * 1.4));
    }
    dataConf = dataTint ? randomDate(dataTint, hoje) : null;
  }
  if (progress > 0.6) {
    embAcab = Math.floor((confeccaoRoupoes + confeccaoFelpos) * Math.min(1, (progress - 0.5) * 1.5));
    dataArmExp = dataConf ? randomDate(dataConf, hoje) : null;
  }
  if (progress > 0.8) {
    stockCx = Math.floor(embAcab * Math.min(1, (progress - 0.7) * 2));
    dataEnt = dataArmExp ? randomDate(dataArmExp, hoje) : null;
  }
  if (progress > 0.9) {
    facturada = Math.floor(stockCx * Math.min(1, (progress - 0.85) * 4));
  }
  
  const emAberto = qtdPedida - facturada;
  const familia = familias[Math.floor(Math.random() * familias.length)];
  
  return {
    id: `ORD-${String(index + 1).padStart(5, '0')}`,
    nrDocumento: `EC${String(2024000 + index).padStart(8, '0')}`,
    terceiro: clients[Math.floor(Math.random() * clients.length)],
    dataEmissao: emissao,
    dataPedida: pedida,
    item: Math.floor(Math.random() * 10) + 1,
    po: `PO-${Math.floor(Math.random() * 900000) + 100000}`,
    codArtigo: `ART${String(Math.floor(Math.random() * 9000) + 1000)}`,
    referencia: `REF-${familia.substring(0, 3)}-${Math.floor(Math.random() * 999)}`,
    cor: `C${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}`,
    descricaoCor: cores[Math.floor(Math.random() * cores.length)],
    tam: tamanhos[Math.floor(Math.random() * tamanhos.length)],
    familia,
    descricaoTam: tamanhos[Math.floor(Math.random() * tamanhos.length)],
    ean: String(Math.floor(Math.random() * 9000000000000) + 1000000000000),
    qtdPedida,
    dataTec: progress > 0.05 ? randomDate(emissao, hoje) : null,
    felpoCru,
    dataFelpoCru,
    tinturaria,
    dataTint,
    confeccaoRoupoes,
    confeccaoFelpos,
    dataConf,
    embAcab,
    dataArmExp,
    stockCx,
    dataEnt,
    dataEspecial: Math.random() > 0.8 ? randomDate(emissao, pedida) : null,
    dataPrinter: Math.random() > 0.9 ? randomDate(emissao, hoje) : null,
    dataDebuxo: Math.random() > 0.85 ? randomDate(emissao, hoje) : null,
    dataAmostras: Math.random() > 0.7 ? randomDate(emissao, hoje) : null,
    dataBordados: Math.random() > 0.9 ? randomDate(emissao, hoje) : null,
    facturada,
    emAberto
  };
}

// Generate 150 sample orders
export const mockOrders: Order[] = Array.from({ length: 150 }, (_, i) => generateOrder(i));

export function calculateKPIs(orders: Order[]): DashboardKPI {
  const hoje = new Date();
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  
  const activeOrders = orders.filter(o => o.emAberto > 0);
  const delayedOrders = orders.filter(o => o.emAberto > 0 && o.dataPedida < hoje);
  const completedThisMonth = orders.filter(o => o.emAberto === 0 && o.dataEnt && o.dataEnt >= inicioMes);
  const dueThisWeek = orders.filter(o => o.emAberto > 0 && o.dataPedida >= inicioSemana && o.dataPedida <= fimSemana);
  const dueThisMonth = orders.filter(o => o.emAberto > 0 && o.dataPedida >= inicioMes && o.dataPedida <= fimMes);
  
  const totalQuantityInProduction = orders.reduce((sum, o) => {
    return sum + o.felpoCru + o.tinturaria + o.confeccaoRoupoes + o.confeccaoFelpos + o.embAcab;
  }, 0);
  
  const totalInvoiced = orders.reduce((sum, o) => sum + o.facturada, 0);
  const totalPending = orders.reduce((sum, o) => sum + o.emAberto, 0);
  const totalRequested = orders.reduce((sum, o) => sum + o.qtdPedida, 0);
  
  return {
    totalOrders: orders.length,
    activeOrders: activeOrders.length,
    delayedOrders: delayedOrders.length,
    completedThisMonth: completedThisMonth.length,
    dueThisWeek: dueThisWeek.length,
    dueThisMonth: dueThisMonth.length,
    totalQuantityInProduction,
    totalInvoiced,
    totalPending,
    fulfillmentRate: totalRequested > 0 ? Math.round((totalInvoiced / totalRequested) * 100) : 0
  };
}

export function calculateSectorMetrics(orders: Order[]): SectorMetrics[] {
  const sectors: ProductionSector[] = ['tecelagem', 'felpo-cru', 'tinturaria', 'confeccao', 'embalagem', 'expedicao'];
  
  return sectors.map(sector => {
    let currentQuantity = 0;
    let orderCount = 0;
    
    orders.forEach(order => {
      let qty = 0;
      switch (sector) {
        case 'tecelagem':
          qty = order.dataTec ? Math.max(0, order.qtdPedida - order.felpoCru) : 0;
          break;
        case 'felpo-cru':
          qty = order.felpoCru - order.tinturaria;
          break;
        case 'tinturaria':
          qty = order.tinturaria - (order.confeccaoRoupoes + order.confeccaoFelpos);
          break;
        case 'confeccao':
          qty = (order.confeccaoRoupoes + order.confeccaoFelpos) - order.embAcab;
          break;
        case 'embalagem':
          qty = order.embAcab - order.stockCx;
          break;
        case 'expedicao':
          qty = order.stockCx - order.facturada;
          break;
      }
      if (qty > 0) {
        currentQuantity += qty;
        orderCount++;
      }
    });
    
    return {
      sector,
      currentQuantity,
      orderCount,
      avgProcessingDays: Math.floor(Math.random() * 5) + 2,
      occupancyRate: Math.min(100, Math.floor((currentQuantity / 10000) * 100))
    };
  });
}

export const mockImportLogs: ImportLog[] = [
  {
    id: '1',
    fileName: 'ENCOMENDAS_2025-01-31.xlsx',
    importDate: new Date('2025-01-31T08:30:00'),
    recordCount: 150,
    status: 'success'
  },
  {
    id: '2',
    fileName: 'ENCOMENDAS_2025-01-30.xlsx',
    importDate: new Date('2025-01-30T08:15:00'),
    recordCount: 148,
    status: 'success'
  },
  {
    id: '3',
    fileName: 'ENCOMENDAS_2025-01-29.xlsx',
    importDate: new Date('2025-01-29T09:00:00'),
    recordCount: 145,
    status: 'partial',
    errors: ['2 registos com formato de data inválido']
  }
];

export function getUniqueClients(orders: Order[]): string[] {
  return [...new Set(orders.map(o => o.terceiro))].sort();
}

export function getUniqueFamilias(orders: Order[]): string[] {
  return [...new Set(orders.map(o => o.familia))].sort();
}
