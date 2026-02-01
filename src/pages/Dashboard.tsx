import { MainLayout } from '@/components/layout/MainLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { SectorOverview } from '@/components/dashboard/SectorOverview';
import { AlertsList } from '@/components/dashboard/AlertsList';
import { OrdersByClientChart } from '@/components/dashboard/OrdersByClientChart';
import { OrdersByStatusChart } from '@/components/dashboard/OrdersByStatusChart';
import { mockOrders, calculateKPIs, calculateSectorMetrics } from '@/data/mockOrders';
import { 
  Package, 
  AlertTriangle, 
  CalendarClock, 
  TrendingUp, 
  Boxes,
  FileCheck
} from 'lucide-react';

export default function Dashboard() {
  const kpis = calculateKPIs(mockOrders);
  const sectorMetrics = calculateSectorMetrics(mockOrders);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard
            title="Encomendas Activas"
            value={kpis.activeOrders}
            subtitle={`de ${kpis.totalOrders} total`}
            icon={<Package className="w-5 h-5" />}
            accentColor="primary"
            className="animate-fade-in stagger-1"
          />
          <KPICard
            title="Atrasadas"
            value={kpis.delayedOrders}
            subtitle="requerem atenção"
            icon={<AlertTriangle className="w-5 h-5" />}
            accentColor="danger"
            trend={{ value: -12, label: 'vs semana anterior' }}
            className="animate-fade-in stagger-2"
          />
          <KPICard
            title="Esta Semana"
            value={kpis.dueThisWeek}
            subtitle="entregas previstas"
            icon={<CalendarClock className="w-5 h-5" />}
            accentColor="warning"
            className="animate-fade-in stagger-3"
          />
          <KPICard
            title="Este Mês"
            value={kpis.dueThisMonth}
            subtitle="entregas previstas"
            icon={<CalendarClock className="w-5 h-5" />}
            accentColor="info"
            className="animate-fade-in stagger-4"
          />
          <KPICard
            title="Taxa Cumprimento"
            value={`${kpis.fulfillmentRate}%`}
            subtitle="encomendas no prazo"
            icon={<TrendingUp className="w-5 h-5" />}
            accentColor="success"
            trend={{ value: 5, label: 'vs mês anterior' }}
            className="animate-fade-in stagger-5"
          />
          <KPICard
            title="Em Produção"
            value={kpis.totalQuantityInProduction.toLocaleString('pt-PT')}
            subtitle="unidades"
            icon={<Boxes className="w-5 h-5" />}
            accentColor="primary"
            className="animate-fade-in stagger-6"
          />
        </div>

        {/* Secondary stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-lg bg-status-success/10">
              <FileCheck className="w-6 h-6 text-status-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {kpis.totalInvoiced.toLocaleString('pt-PT')}
              </p>
              <p className="text-sm text-muted-foreground">Unidades facturadas</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-lg bg-status-warning/10">
              <Package className="w-6 h-6 text-status-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {kpis.totalPending.toLocaleString('pt-PT')}
              </p>
              <p className="text-sm text-muted-foreground">Unidades em aberto</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {kpis.completedThisMonth}
              </p>
              <p className="text-sm text-muted-foreground">Concluídas este mês</p>
            </div>
          </div>
        </div>

        {/* Charts and details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OrdersByClientChart orders={mockOrders} />
              <OrdersByStatusChart orders={mockOrders} />
            </div>
          </div>
          
          <div className="space-y-6">
            <SectorOverview metrics={sectorMetrics} />
            <AlertsList orders={mockOrders} maxItems={4} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
