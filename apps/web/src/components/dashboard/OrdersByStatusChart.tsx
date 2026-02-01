import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface OrdersByStatusChartProps {
  data: { status: string; count: number }[];
}

export function OrdersByStatusChart({ data }: OrdersByStatusChartProps) {
  const statusMap: Record<string, { name: string; color: string }> = {
    completed: { name: 'Concluídas', color: 'hsl(145, 65%, 42%)' },
    'in-progress': { name: 'Em Produção', color: 'hsl(200, 75%, 50%)' },
    delayed: { name: 'Atrasadas', color: 'hsl(0, 72%, 51%)' },
    pending: { name: 'Pendentes', color: 'hsl(270, 60%, 50%)' }
  };

  const statusData = data.map((item) => ({
    name: statusMap[item.status]?.name ?? item.status,
    value: item.count,
    color: statusMap[item.status]?.color ?? 'hsl(210, 40%, 60%)'
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground text-sm">{data.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.value} encomendas
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm h-full">
      <h3 className="text-base font-semibold text-foreground mb-4">Estado das Encomendas</h3>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statusData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
