import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  icon?: ReactNode;
  accentColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const accentColors = {
  primary: 'bg-primary',
  success: 'bg-status-success',
  warning: 'bg-status-warning',
  danger: 'bg-status-danger',
  info: 'bg-sector-tecelagem'
};

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon,
  accentColor = 'primary',
  className 
}: KPICardProps) {
  const TrendIcon = trend?.value && trend.value > 0 
    ? TrendingUp 
    : trend?.value && trend.value < 0 
      ? TrendingDown 
      : Minus;
  
  const trendColor = trend?.value && trend.value > 0 
    ? 'text-status-success' 
    : trend?.value && trend.value < 0 
      ? 'text-status-danger' 
      : 'text-muted-foreground';

  return (
    <div className={cn("kpi-card group", className)}>
      <div className={cn("kpi-card-accent", accentColors[accentColor])} />
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
            {typeof value === 'number' ? value.toLocaleString('pt-PT') : value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        {icon && (
          <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className={cn("flex items-center gap-1 mt-3 text-xs font-medium", trendColor)}>
          <TrendIcon className="w-3 h-3" />
          <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
          <span className="text-muted-foreground ml-1">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
