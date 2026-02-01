import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface AlertsListProps {
  alerts: {
    id: string;
    type: string;
    severity: string;
    orderId: string | null;
    message: string;
    createdAt: string;
    orderDocument: string | null;
    clientName: string | null;
    dueDate: string | null;
    openQuantity: number | null;
  }[];
  maxItems?: number;
}

export function AlertsList({ alerts, maxItems = 5 }: AlertsListProps) {
  const hoje = new Date();
  const relevant = alerts.slice(0, maxItems);

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">Alertas</h3>
        <Link 
          to="/orders?status=delayed" 
          className="text-xs text-accent hover:underline flex items-center gap-1"
        >
          Ver todos <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {relevant.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sem alertas activos
          </p>
        ) : (
          relevant.map((alert) => {
            const dueDate = alert.dueDate ? new Date(alert.dueDate) : null;
            const daysUntil = dueDate ? Math.ceil((dueDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)) : null;
            const isLate = daysUntil !== null && daysUntil < 0;

            return (
              <Link
                key={alert.id}
                to={alert.orderId ? `/orders/${alert.orderId}` : '/orders'}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg transition-colors group',
                  isLate ? 'bg-status-danger/5 hover:bg-status-danger/10' : 'bg-status-warning/5 hover:bg-status-warning/10'
                )}
              >
                <div className={cn(
                  'p-1.5 rounded-md',
                  isLate ? 'bg-status-danger/10' : 'bg-status-warning/10'
                )}>
                  {isLate ? (
                    <AlertTriangle className="w-4 h-4 text-status-danger" />
                  ) : (
                    <Clock className="w-4 h-4 text-status-warning" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {alert.orderDocument ?? alert.message}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {alert.clientName ?? 'Cliente não identificado'}
                    {alert.openQuantity !== null ? ` • ${alert.openQuantity.toLocaleString('pt-PT')} un. em aberto` : ''}
                  </p>
                  {dueDate && daysUntil !== null && (
                    <p className={cn(
                      'text-xs font-medium mt-0.5',
                      isLate ? 'text-status-danger' : 'text-status-warning'
                    )}>
                      {isLate ? `${Math.abs(daysUntil)} dias de atraso` : `Faltam ${daysUntil} dias`}
                      {' • '}Entrega: {format(dueDate, 'd MMM', { locale: pt })}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
