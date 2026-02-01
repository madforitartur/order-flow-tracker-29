import { SECTOR_LABELS, ProductionSector, SectorMetrics } from '@/types/order';
import { cn } from '@/lib/utils';

interface SectorOverviewProps {
  metrics: SectorMetrics[];
}

const sectorColorClasses: Record<ProductionSector, string> = {
  'tecelagem': 'bg-sector-tecelagem',
  'felpo-cru': 'bg-sector-felpo-cru',
  'tinturaria': 'bg-sector-tinturaria',
  'confeccao': 'bg-sector-confeccao',
  'embalagem': 'bg-sector-embalagem',
  'expedicao': 'bg-sector-expedicao'
};

export function SectorOverview({ metrics }: SectorOverviewProps) {
  const maxQuantity = metrics.length > 0 ? Math.max(...metrics.map(m => m.currentQuantity), 1) : 1;

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <h3 className="text-base font-semibold text-foreground mb-4">Ocupação por Sector</h3>
      
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.sector} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", sectorColorClasses[metric.sector])} />
                <span className="font-medium text-foreground">
                  {SECTOR_LABELS[metric.sector]}
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>{metric.orderCount} enc.</span>
                <span className="font-semibold text-foreground">
                  {metric.currentQuantity.toLocaleString('pt-PT')} un.
                </span>
              </div>
            </div>
            
            <div className="progress-track">
              <div 
                className={cn("progress-fill", sectorColorClasses[metric.sector])}
                style={{ 
                  width: `${(metric.currentQuantity / maxQuantity) * 100}%`,
                  background: undefined
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-5 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tempo médio por sector</span>
          <span className="font-medium text-foreground">
            {metrics.length > 0
              ? `${Math.round(metrics.reduce((sum, m) => sum + m.avgProcessingDays, 0) / metrics.length)} dias`
              : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
