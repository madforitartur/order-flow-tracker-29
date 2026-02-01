import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockOrders, getUniqueClients, getUniqueFamilias } from '@/data/mockOrders';
import { Order, OrderStatus, SECTOR_LABELS, ProductionSector } from '@/types/order';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown, 
  ChevronUp,
  Eye,
  ArrowUpDown,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortField = 'nrDocumento' | 'terceiro' | 'dataEmissao' | 'dataPedida' | 'qtdPedida' | 'emAberto';
type SortDirection = 'asc' | 'desc';

function getOrderStatus(order: Order): OrderStatus {
  const hoje = new Date();
  if (order.emAberto === 0) return 'completed';
  if (order.dataPedida < hoje) return 'delayed';
  if (order.felpoCru > 0 || order.tinturaria > 0) return 'in-progress';
  return 'pending';
}

function getCurrentSector(order: Order): ProductionSector | null {
  if (order.stockCx > order.facturada) return 'expedicao';
  if (order.embAcab > order.stockCx) return 'embalagem';
  if (order.confeccaoRoupoes + order.confeccaoFelpos > order.embAcab) return 'confeccao';
  if (order.tinturaria > order.confeccaoRoupoes + order.confeccaoFelpos) return 'tinturaria';
  if (order.felpoCru > order.tinturaria) return 'felpo-cru';
  if (order.dataTec) return 'tecelagem';
  return null;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  'completed': { label: 'Concluída', className: 'status-completed' },
  'in-progress': { label: 'Em Produção', className: 'status-in-progress' },
  'delayed': { label: 'Atrasada', className: 'status-delayed' },
  'pending': { label: 'Pendente', className: 'status-pending' }
};

const sectorColorClasses: Record<ProductionSector, string> = {
  'tecelagem': 'bg-sector-tecelagem',
  'felpo-cru': 'bg-sector-felpo-cru',
  'tinturaria': 'bg-sector-tinturaria',
  'confeccao': 'bg-sector-confeccao',
  'embalagem': 'bg-sector-embalagem',
  'expedicao': 'bg-sector-expedicao'
};

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [familiaFilter, setFamiliaFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('dataPedida');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const clients = useMemo(() => getUniqueClients(mockOrders), []);
  const familias = useMemo(() => getUniqueFamilias(mockOrders), []);

  const filteredOrders = useMemo(() => {
    let result = [...mockOrders];

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.nrDocumento.toLowerCase().includes(term) ||
        o.po.toLowerCase().includes(term) ||
        o.terceiro.toLowerCase().includes(term) ||
        o.referencia.toLowerCase().includes(term)
      );
    }

    // Client filter
    if (clientFilter !== 'all') {
      result = result.filter(o => o.terceiro === clientFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(o => getOrderStatus(o) === statusFilter);
    }

    // Familia filter
    if (familiaFilter !== 'all') {
      result = result.filter(o => o.familia === familiaFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'nrDocumento':
          comparison = a.nrDocumento.localeCompare(b.nrDocumento);
          break;
        case 'terceiro':
          comparison = a.terceiro.localeCompare(b.terceiro);
          break;
        case 'dataEmissao':
          comparison = a.dataEmissao.getTime() - b.dataEmissao.getTime();
          break;
        case 'dataPedida':
          comparison = a.dataPedida.getTime() - b.dataPedida.getTime();
          break;
        case 'qtdPedida':
          comparison = a.qtdPedida - b.qtdPedida;
          break;
        case 'emAberto':
          comparison = a.emAberto - b.emAberto;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [searchTerm, clientFilter, statusFilter, familiaFilter, sortField, sortDirection]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setClientFilter('all');
    setStatusFilter('all');
    setFamiliaFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || clientFilter !== 'all' || statusFilter !== 'all' || familiaFilter !== 'all';

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Search and filter bar */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pesquisar por documento, PO, cliente ou referência..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Cliente</label>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os clientes</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client} value={client}>{client}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Estado</label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os estados</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in-progress">Em Produção</SelectItem>
                    <SelectItem value="delayed">Atrasada</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Família</label>
                <Select value={familiaFilter} onValueChange={setFamiliaFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as famílias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as famílias</SelectItem>
                    {familias.map(familia => (
                      <SelectItem key={familia} value={familia}>{familia}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button variant="ghost" onClick={clearFilters} className="gap-2 text-muted-foreground">
                    <X className="w-4 h-4" />
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {filteredOrders.length} encomendas encontradas
          </p>
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 por página</SelectItem>
              <SelectItem value="25">25 por página</SelectItem>
              <SelectItem value="50">50 por página</SelectItem>
              <SelectItem value="100">100 por página</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="data-table-header">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button 
                      className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort('nrDocumento')}
                    >
                      Documento
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button 
                      className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort('terceiro')}
                    >
                      Cliente
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button 
                      className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort('dataPedida')}
                    >
                      Data Entrega
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Família
                  </th>
                  <th className="px-4 py-3 text-right">
                    <button 
                      className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground ml-auto"
                      onClick={() => handleSort('qtdPedida')}
                    >
                      Qtd. Pedida
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <button 
                      className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground ml-auto"
                      onClick={() => handleSort('emAberto')}
                    >
                      Em Aberto
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Sector Actual
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                    Acções
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => {
                  const status = getOrderStatus(order);
                  const sector = getCurrentSector(order);
                  const config = statusConfig[status];

                  return (
                    <tr key={order.id} className="data-table-row">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground text-sm">{order.nrDocumento}</p>
                          <p className="text-xs text-muted-foreground">{order.po}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-foreground">{order.terceiro}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-foreground">
                          {format(order.dataPedida, "d MMM yyyy", { locale: pt })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground">{order.familia}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-foreground">
                          {order.qtdPedida.toLocaleString('pt-PT')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn(
                          "text-sm font-medium",
                          order.emAberto > 0 ? "text-status-warning" : "text-status-success"
                        )}>
                          {order.emAberto.toLocaleString('pt-PT')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sector ? (
                          <div className="flex items-center gap-2">
                            <div className={cn("sector-indicator", sectorColorClasses[sector])} />
                            <span className="text-sm text-foreground">{SECTOR_LABELS[sector]}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("status-badge", config.className)}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link to={`/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Seguinte
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
