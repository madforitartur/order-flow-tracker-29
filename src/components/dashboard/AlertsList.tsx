import { Order } from '@/types/order';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface AlertsListProps {
  orders: Order[];
  maxItems?: number;
}

export function AlertsList({ orders, maxItems = 5 }: AlertsListProps) {
  const hoje = new Date();
  
  const delayedOrders = orders
    .filter(o => o.emAberto > 0 && o.dataPedida < hoje)
    .sort((a, b) => a.dataPedida.getTime() - b.dataPedida.getTime())
    .slice(0, maxItems);

  const urgentOrders = orders
    .filter(o => {
      if (o.emAberto === 0) return false;
      const daysUntilDue = Math.ceil((o.dataPedida.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue > 0 && daysUntilDue <= 7;
    })
    .sort((a, b) => a.dataPedida.getTime() - b.dataPedida.getTime())
    .slice(0, maxItems);

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
        {delayedOrders.length === 0 && urgentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sem alertas activos
          </p>
        ) : (
          <>
            {delayedOrders.map((order) => {
              const daysLate = Math.ceil((hoje.getTime() - order.dataPedida.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-status-danger/5 hover:bg-status-danger/10 transition-colors group"
                >
                  <div className="p-1.5 rounded-md bg-status-danger/10">
                    <AlertTriangle className="w-4 h-4 text-status-danger" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {order.nrDocumento}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.terceiro} • {order.emAberto.toLocaleString('pt-PT')} un. em aberto
                    </p>
                    <p className="text-xs text-status-danger font-medium mt-0.5">
                      {daysLate} dias de atraso
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}

            {urgentOrders.slice(0, Math.max(0, maxItems - delayedOrders.length)).map((order) => {
              const daysUntil = Math.ceil((order.dataPedida.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-status-warning/5 hover:bg-status-warning/10 transition-colors group"
                >
                  <div className="p-1.5 rounded-md bg-status-warning/10">
                    <Clock className="w-4 h-4 text-status-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {order.nrDocumento}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.terceiro} • Entrega: {format(order.dataPedida, "d MMM", { locale: pt })}
                    </p>
                    <p className="text-xs text-status-warning font-medium mt-0.5">
                      Faltam {daysUntil} dias
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
