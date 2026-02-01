import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SECTOR_LABELS, ProductionSector } from '@/types/order';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ArrowLeft, Download, Calendar, Package, User, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOrderQuery } from '@/hooks/useOrdersQuery';

const sectorColorClasses: Record<ProductionSector, string> = {
  'tecelagem': 'bg-sector-tecelagem',
  'felpo-cru': 'bg-sector-felpo-cru',
  'tinturaria': 'bg-sector-tinturaria',
  'confeccao': 'bg-sector-confeccao',
  'embalagem': 'bg-sector-embalagem',
  'expedicao': 'bg-sector-expedicao'
};

const sectorBorderClasses: Record<ProductionSector, string> = {
  'tecelagem': 'border-sector-tecelagem',
  'felpo-cru': 'border-sector-felpo-cru',
  'tinturaria': 'border-sector-tinturaria',
  'confeccao': 'border-sector-confeccao',
  'embalagem': 'border-sector-embalagem',
  'expedicao': 'border-sector-expedicao'
};

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrderQuery(id);

  if (!order && !isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-muted-foreground">Encomenda não encontrada</p>
          <Link to="/orders">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar às encomendas
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-muted-foreground">A carregar encomenda...</p>
        </div>
      </MainLayout>
    );
  }

  const hoje = new Date();
  const isDelayed = order.emAberto > 0 && order.dataPedida < hoje;
  const isCompleted = order.emAberto === 0;
  const progress = Math.round(((order.qtdPedida - order.emAberto) / order.qtdPedida) * 100);

  // Build sector steps
  const sectors: { sector: ProductionSector; quantity: number; date: Date | null; isActive: boolean }[] = [
    { sector: 'tecelagem', quantity: order.felpoCru, date: order.dataTec, isActive: !!order.dataTec },
    { sector: 'felpo-cru', quantity: order.felpoCru, date: order.dataFelpoCru, isActive: order.felpoCru > 0 },
    { sector: 'tinturaria', quantity: order.tinturaria, date: order.dataTint, isActive: order.tinturaria > 0 },
    { sector: 'confeccao', quantity: order.confeccaoRoupoes + order.confeccaoFelpos, date: order.dataConf, isActive: (order.confeccaoRoupoes + order.confeccaoFelpos) > 0 },
    { sector: 'embalagem', quantity: order.embAcab, date: order.dataArmExp, isActive: order.embAcab > 0 },
    { sector: 'expedicao', quantity: order.stockCx, date: order.dataEnt, isActive: order.stockCx > 0 }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{order.nrDocumento}</h1>
              <p className="text-sm text-muted-foreground">PO: {order.po}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Status banner */}
        <div className={cn(
          "rounded-xl p-4 flex items-center justify-between",
          isCompleted ? "bg-status-success/10 border border-status-success/20" :
          isDelayed ? "bg-status-danger/10 border border-status-danger/20" :
          "bg-status-progress/10 border border-status-progress/20"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isCompleted ? "bg-status-success text-white" :
              isDelayed ? "bg-status-danger text-white" :
              "bg-status-progress text-white"
            )}>
              {isCompleted ? <Check className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            </div>
            <div>
              <p className={cn(
                "font-semibold",
                isCompleted ? "text-status-success" :
                isDelayed ? "text-status-danger" :
                "text-status-progress"
              )}>
                {isCompleted ? "Encomenda Concluída" :
                 isDelayed ? "Encomenda Atrasada" :
                 "Em Produção"}
              </p>
              <p className="text-sm text-muted-foreground">
                {progress}% concluído • {order.emAberto.toLocaleString('pt-PT')} un. em aberto
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Data de entrega</p>
            <p className={cn(
              "font-semibold",
              isDelayed ? "text-status-danger" : "text-foreground"
            )}>
              {format(order.dataPedida, "d 'de' MMMM 'de' yyyy", { locale: pt })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details card */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Detalhes do Artigo</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Código Artigo</p>
                  <p className="font-medium text-foreground">{order.codArtigo}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Referência</p>
                  <p className="font-medium text-foreground">{order.referencia}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Família</p>
                  <p className="font-medium text-foreground">{order.familia}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cor</p>
                  <p className="font-medium text-foreground">{order.descricaoCor} ({order.cor})</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tamanho</p>
                  <p className="font-medium text-foreground">{order.tam}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">EAN</p>
                  <p className="font-medium text-foreground font-mono text-sm">{order.ean}</p>
                </div>
              </div>
            </div>

            {/* Production progress */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-6">Progresso na Produção</h3>
              
              <div className="relative">
                {/* Progress line */}
                <div className="absolute left-5 top-10 bottom-10 w-0.5 bg-border" />
                
                {/* Sector steps */}
                <div className="space-y-6">
                  {sectors.map((item, index) => {
                    const isComplete = item.quantity >= order.qtdPedida * 0.9;
                    const hasStarted = item.quantity > 0;
                    
                    return (
                      <div key={item.sector} className="flex items-start gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2",
                          isComplete ? cn(sectorColorClasses[item.sector], "border-transparent text-white") :
                          hasStarted ? cn("bg-card", sectorBorderClasses[item.sector]) :
                          "bg-card border-border"
                        )}>
                          {isComplete ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <span className={cn(
                              "text-sm font-semibold",
                              hasStarted ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {index + 1}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={cn(
                              "font-medium",
                              hasStarted ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {SECTOR_LABELS[item.sector]}
                            </p>
                            {item.date && (
                              <p className="text-xs text-muted-foreground">
                                {format(item.date, "d MMM yyyy", { locale: pt })}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="progress-track flex-1">
                              <div 
                                className={cn("progress-fill", sectorColorClasses[item.sector])}
                                style={{ 
                                  width: `${Math.min(100, (item.quantity / order.qtdPedida) * 100)}%`,
                                  background: undefined
                                }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground shrink-0 w-20 text-right">
                              {item.quantity.toLocaleString('pt-PT')} un.
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client info */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-muted">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">Cliente</h3>
              </div>
              <p className="text-lg font-medium text-foreground">{order.terceiro}</p>
            </div>

            {/* Quantities */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">Quantidades</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pedida</span>
                  <span className="font-semibold text-foreground">
                    {order.qtdPedida.toLocaleString('pt-PT')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Facturada</span>
                  <span className="font-semibold text-status-success">
                    {order.facturada.toLocaleString('pt-PT')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Em Aberto</span>
                  <span className={cn(
                    "font-semibold",
                    order.emAberto > 0 ? "text-status-warning" : "text-status-success"
                  )}>
                    {order.emAberto.toLocaleString('pt-PT')}
                  </span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">Datas</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emissão</span>
                  <span className="font-medium text-foreground">
                    {format(order.dataEmissao, "d/MM/yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entrega</span>
                  <span className={cn(
                    "font-medium",
                    isDelayed ? "text-status-danger" : "text-foreground"
                  )}>
                    {format(order.dataPedida, "d/MM/yyyy")}
                  </span>
                </div>
                {order.dataEnt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expedida</span>
                    <span className="font-medium text-status-success">
                      {format(order.dataEnt, "d/MM/yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
