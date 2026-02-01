import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockOrders, getUniqueClients } from '@/data/mockOrders';
import { SECTOR_LABELS, ProductionSector, Order } from '@/types/order';
import { format, differenceInDays, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sectorColorClasses: Record<ProductionSector, string> = {
  'tecelagem': 'bg-sector-tecelagem',
  'felpo-cru': 'bg-sector-felpo-cru',
  'tinturaria': 'bg-sector-tinturaria',
  'confeccao': 'bg-sector-confeccao',
  'embalagem': 'bg-sector-embalagem',
  'expedicao': 'bg-sector-expedicao'
};

interface TimelineBar {
  sector: ProductionSector;
  startDate: Date;
  endDate: Date;
  quantity: number;
}

function getOrderTimeline(order: Order): TimelineBar[] {
  const bars: TimelineBar[] = [];
  
  // Tecelagem
  if (order.dataTec && order.dataFelpoCru) {
    bars.push({
      sector: 'tecelagem',
      startDate: order.dataTec,
      endDate: order.dataFelpoCru,
      quantity: order.felpoCru
    });
  }
  
  // Felpo Cru
  if (order.dataFelpoCru && order.dataTint) {
    bars.push({
      sector: 'felpo-cru',
      startDate: order.dataFelpoCru,
      endDate: order.dataTint,
      quantity: order.felpoCru
    });
  }
  
  // Tinturaria
  if (order.dataTint && order.dataConf) {
    bars.push({
      sector: 'tinturaria',
      startDate: order.dataTint,
      endDate: order.dataConf,
      quantity: order.tinturaria
    });
  }
  
  // Confecção
  if (order.dataConf && order.dataArmExp) {
    bars.push({
      sector: 'confeccao',
      startDate: order.dataConf,
      endDate: order.dataArmExp,
      quantity: order.confeccaoRoupoes + order.confeccaoFelpos
    });
  }
  
  // Embalagem
  if (order.dataArmExp && order.dataEnt) {
    bars.push({
      sector: 'embalagem',
      startDate: order.dataArmExp,
      endDate: order.dataEnt,
      quantity: order.embAcab
    });
  }
  
  // Expedição
  if (order.dataEnt && order.facturada > 0) {
    bars.push({
      sector: 'expedicao',
      startDate: order.dataEnt,
      endDate: addDays(order.dataEnt, 2),
      quantity: order.stockCx
    });
  }
  
  return bars;
}

export default function Timeline() {
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [viewStart, setViewStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [daysVisible, setDaysVisible] = useState(28);
  
  const clients = useMemo(() => getUniqueClients(mockOrders), []);
  
  const filteredOrders = useMemo(() => {
    let result = mockOrders.filter(o => o.emAberto > 0 || o.dataEnt);
    if (clientFilter !== 'all') {
      result = result.filter(o => o.terceiro === clientFilter);
    }
    return result.slice(0, 30); // Limit for performance
  }, [clientFilter]);
  
  const viewEnd = addDays(viewStart, daysVisible);
  const hoje = new Date();
  
  const dateColumns = useMemo(() => {
    const cols: Date[] = [];
    for (let i = 0; i < daysVisible; i++) {
      cols.push(addDays(viewStart, i));
    }
    return cols;
  }, [viewStart, daysVisible]);
  
  const getBarPosition = (start: Date, end: Date) => {
    const dayWidth = 100 / daysVisible;
    const startDiff = differenceInDays(start, viewStart);
    const duration = differenceInDays(end, start) || 1;
    
    return {
      left: `${Math.max(0, startDiff * dayWidth)}%`,
      width: `${Math.min(100 - Math.max(0, startDiff * dayWidth), duration * dayWidth)}%`
    };
  };
  
  const todayPosition = {
    left: `${(differenceInDays(hoje, viewStart) / daysVisible) * 100}%`
  };
  
  const navigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setViewStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
    } else {
      const days = direction === 'prev' ? -7 : 7;
      setViewStart(addDays(viewStart, days));
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Controls */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('today')}>
                <Calendar className="w-4 h-4 mr-2" />
                Hoje
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <span className="text-sm font-medium text-foreground ml-3">
                {format(viewStart, "d MMM", { locale: pt })} - {format(viewEnd, "d MMM yyyy", { locale: pt })}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDaysVisible(Math.min(56, daysVisible + 7))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDaysVisible(Math.max(14, daysVisible - 7))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
              
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-[200px]">
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
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4">
          {(Object.keys(SECTOR_LABELS) as ProductionSector[]).map((sector) => (
            <div key={sector} className="flex items-center gap-2">
              <div className={cn("w-4 h-4 rounded", sectorColorClasses[sector])} />
              <span className="text-xs text-muted-foreground">{SECTOR_LABELS[sector]}</span>
            </div>
          ))}
        </div>
        
        {/* Timeline */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Header with dates */}
              <div className="flex border-b border-border sticky top-0 bg-muted/50 z-10">
                <div className="w-48 shrink-0 px-4 py-3 border-r border-border">
                  <span className="text-xs font-semibold text-muted-foreground">Encomenda</span>
                </div>
                <div className="flex-1 flex">
                  {dateColumns.map((date, i) => {
                    const isToday = differenceInDays(date, hoje) === 0;
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    return (
                      <div 
                        key={i} 
                        className={cn(
                          "flex-1 text-center py-2 border-r border-border/50 last:border-r-0",
                          isWeekend && "bg-muted/30",
                          isToday && "bg-primary/10"
                        )}
                        style={{ minWidth: '30px' }}
                      >
                        <p className={cn(
                          "text-[10px] font-medium",
                          isToday ? "text-primary" : "text-muted-foreground"
                        )}>
                          {format(date, "EEE", { locale: pt })}
                        </p>
                        <p className={cn(
                          "text-xs font-semibold",
                          isToday ? "text-primary" : "text-foreground"
                        )}>
                          {format(date, "d")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Rows */}
              {filteredOrders.map((order) => {
                const timeline = getOrderTimeline(order);
                const isDelayed = order.emAberto > 0 && order.dataPedida < hoje;
                
                return (
                  <div key={order.id} className="flex border-b border-border last:border-b-0 hover:bg-muted/20">
                    <div className="w-48 shrink-0 px-4 py-3 border-r border-border">
                      <p className="text-sm font-medium text-foreground truncate">{order.nrDocumento}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.terceiro}</p>
                    </div>
                    <div className="flex-1 relative py-2 px-1" style={{ height: '56px' }}>
                      {/* Today indicator line */}
                      {differenceInDays(hoje, viewStart) >= 0 && differenceInDays(hoje, viewStart) < daysVisible && (
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-status-danger z-20"
                          style={todayPosition}
                        />
                      )}
                      
                      {/* Due date indicator */}
                      {differenceInDays(order.dataPedida, viewStart) >= 0 && differenceInDays(order.dataPedida, viewStart) < daysVisible && (
                        <div 
                          className={cn(
                            "absolute top-0 bottom-0 w-0.5 z-10",
                            isDelayed ? "bg-status-danger/50" : "bg-primary/50"
                          )}
                          style={{ left: `${(differenceInDays(order.dataPedida, viewStart) / daysVisible) * 100}%` }}
                        />
                      )}
                      
                      {/* Timeline bars */}
                      {timeline.map((bar, i) => {
                        const pos = getBarPosition(bar.startDate, bar.endDate);
                        return (
                          <Tooltip key={i}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "timeline-bar absolute",
                                  sectorColorClasses[bar.sector]
                                )}
                                style={{
                                  ...pos,
                                  top: '8px',
                                  height: '32px'
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-medium">{SECTOR_LABELS[bar.sector]}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(bar.startDate, "d MMM", { locale: pt })} - {format(bar.endDate, "d MMM", { locale: pt })}
                              </p>
                              <p className="text-xs">{bar.quantity.toLocaleString('pt-PT')} un.</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
