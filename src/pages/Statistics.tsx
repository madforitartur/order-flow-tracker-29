import { MainLayout } from '@/components/layout/MainLayout';
import { mockOrders, calculateKPIs, calculateSectorMetrics } from '@/data/mockOrders';
import { SECTOR_LABELS, ProductionSector } from '@/types/order';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';

const COLORS = [
  'hsl(200, 80%, 45%)',
  'hsl(30, 90%, 55%)',
  'hsl(270, 60%, 50%)',
  'hsl(340, 70%, 50%)',
  'hsl(160, 60%, 40%)',
  'hsl(220, 70%, 50%)'
];

export default function Statistics() {
  const kpis = calculateKPIs(mockOrders);
  const sectorMetrics = calculateSectorMetrics(mockOrders);

  // Orders by family
  const ordersByFamily = useMemo(() => {
    const grouped = mockOrders.reduce((acc, order) => {
      const existing = acc.find(f => f.name === order.familia);
      if (existing) {
        existing.value += 1;
        existing.quantity += order.qtdPedida;
      } else {
        acc.push({ name: order.familia, value: 1, quantity: order.qtdPedida });
      }
      return acc;
    }, [] as { name: string; value: number; quantity: number }[]);
    return grouped.sort((a, b) => b.value - a.value);
  }, []);

  // Daily orders trend
  const dailyTrend = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      const ordersOnDay = mockOrders.filter(o => 
        isSameDay(o.dataEmissao, day)
      ).length;
      return {
        date: format(day, 'd', { locale: pt }),
        orders: ordersOnDay
      };
    });
  }, []);

  // Sector processing time data
  const sectorData = sectorMetrics.map(m => ({
    name: SECTOR_LABELS[m.sector],
    quantity: m.currentQuantity,
    orders: m.orderCount,
    avgDays: m.avgProcessingDays
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs text-muted-foreground mt-1">
              {entry.name}: {entry.value.toLocaleString('pt-PT')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Taxa de Cumprimento</p>
            <p className="text-3xl font-bold text-status-success">{kpis.fulfillmentRate}%</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Encomendas Activas</p>
            <p className="text-3xl font-bold text-foreground">{kpis.activeOrders}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Unidades Facturadas</p>
            <p className="text-3xl font-bold text-status-success">
              {kpis.totalInvoiced.toLocaleString('pt-PT')}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Unidades Pendentes</p>
            <p className="text-3xl font-bold text-status-warning">
              {kpis.totalPending.toLocaleString('pt-PT')}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily trend */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="text-base font-semibold text-foreground mb-4">
              Encomendas por Dia (Este Mês)
            </h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 0, r: 3 }}
                    name="Encomendas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sector occupancy */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="text-base font-semibold text-foreground mb-4">
              Ocupação por Sector
            </h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="quantity" radius={[0, 4, 4, 0]} barSize={20} name="Unidades">
                    {sectorData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders by family */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="text-base font-semibold text-foreground mb-4">
              Encomendas por Família
            </h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersByFamily}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {ordersByFamily.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Processing time */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="text-base font-semibold text-foreground mb-4">
              Tempo Médio por Sector (dias)
            </h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="avgDays" radius={[4, 4, 0, 0]} barSize={30} name="Dias">
                    {sectorData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
