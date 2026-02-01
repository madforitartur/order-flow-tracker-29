import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface OrdersByClientChartProps {
  data: { clientName: string; orderCount: number; totalQuantity: number }[];
}

const COLORS = [
  'hsl(200, 80%, 45%)',
  'hsl(30, 90%, 55%)',
  'hsl(270, 60%, 50%)',
  'hsl(340, 70%, 50%)',
  'hsl(160, 60%, 40%)',
  'hsl(220, 70%, 50%)',
  'hsl(45, 85%, 50%)',
  'hsl(180, 55%, 45%)'
];

export function OrdersByClientChart({ data }: OrdersByClientChartProps) {
  const topClients = [...data].sort((a, b) => b.orderCount - a.orderCount).slice(0, 8);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground text-sm">{data.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.orderCount} encomendas
          </p>
          <p className="text-xs text-muted-foreground">
            {data.totalQuantity.toLocaleString('pt-PT')} unidades
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm h-full">
      <h3 className="text-base font-semibold text-foreground mb-4">Encomendas por Cliente</h3>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={topClients.map((item) => ({
                name: item.clientName,
                value: item.orderCount,
                quantity: item.totalQuantity
              }))}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {topClients.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="vertical" 
              align="right" 
              verticalAlign="middle"
              formatter={(value) => (
                <span className="text-xs text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
