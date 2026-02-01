import { MainLayout } from '@/components/layout/MainLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { SectorOverview } from '@/components/dashboard/SectorOverview';
import { AlertsList } from '@/components/dashboard/AlertsList';
import { OrdersByClientChart } from '@/components/dashboard/OrdersByClientChart';
import { OrdersByStatusChart } from '@/components/dashboard/OrdersByStatusChart';
import { useDashboardQuery } from '@/hooks/useDashboardQuery';
import type { SectorMetrics } from '@/types/order';
import { 
  Package, 
  AlertTriangle, 
  CalendarClock, 
  TrendingUp, 
  Boxes,
  FileCheck
} from 'lucide-react';

export default function Dashboard() {
  const { kpis, sectors, byClient, byStatus, alerts } = useDashboardQuery();
  const kpiData = kpis.data ?? {
    totalOrders: 0,
    activeOrders: 0,
    delayedOrders: 0,
    completedThisMonth: 0,
    dueThisWeek: 0,
    dueThisMonth: 0,
    totalQuantityInProduction: 0,
    totalInvoiced: 0,
    totalPending: 0,
    fulfillmentRate: 0
  };
  const sectorMetrics = (sectors.data ?? []) as SectorMetrics[];
  const clientData = byClient.data ?? [];
  const statusData = byStatus.data ?? [];
  const alertsData = alerts.data ?? [];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard
            title="Encomendas Activas"
            value={kpiData.activeOrders}
            subtitle={`de ${kpiData.totalOrders} total`}
            icon={<Package className="w-5 h-5" />}
            accentColor="primary"
            className="animate-fade-in stagger-1"
          />
          <KPICard
            title="Atrasadas"
            value={kpiData.delayedOrders}
            subtitle="requerem atenção"
            icon={<AlertTriangle className="w-5 h-5" />}
            accentColor="danger"
            trend={{ value: -12, label: 'vs semana anterior' }}
            className="animate-fade-in stagger-2"
          />
          <KPICard
            title="Esta Semana"
            value={kpiData.dueThisWeek}
            subtitle="entregas previstas"
            icon={<CalendarClock className="w-5 h-5" />}
            accentColor="warning"
            className="animate-fade-in stagger-3"
          />
          <KPICard
            title="Este Mês"
            value={kpiData.dueThisMonth}
            subtitle="entregas previstas"
            icon={<CalendarClock className="w-5 h-5" />}
            accentColor="info"
            className="animate-fade-in stagger-4"
          />
          <KPICard
            title="Taxa Cumprimento"
            value={`${kpiData.fulfillmentRate}%`}
            subtitle="encomendas no prazo"
            icon={<TrendingUp className="w-5 h-5" />}
            accentColor="success"
            trend={{ value: 5, label: 'vs mês anterior' }}
            className="animate-fade-in stagger-5"
          />
          <KPICard
            title="Em Produção"
            value={kpiData.totalQuantityInProduction.toLocaleString('pt-PT')}
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
                {kpiData.totalInvoiced.toLocaleString('pt-PT')}
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
                {kpiData.totalPending.toLocaleString('pt-PT')}
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
                {kpiData.completedThisMonth}
              </p>
              <p className="text-sm text-muted-foreground">Concluídas este mês</p>
            </div>
          </div>
        </div>

        {/* Charts and details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OrdersByClientChart data={clientData} />
              <OrdersByStatusChart data={statusData} />
            </div>
          </div>
          
          <div className="space-y-6">
            <SectorOverview metrics={sectorMetrics} />
            <AlertsList alerts={alertsData} maxItems={4} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
