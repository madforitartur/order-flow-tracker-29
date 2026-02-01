import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, Users, BarChart3, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const reports = [
  {
    id: 'orders-by-client',
    name: 'Encomendas por Cliente',
    description: 'Lista de todas as encomendas agrupadas por cliente com estado actual',
    icon: Users,
    color: 'bg-sector-tecelagem'
  },
  {
    id: 'production-by-sector',
    name: 'Produção por Sector',
    description: 'Quantidade em cada sector, tempo médio de processamento',
    icon: BarChart3,
    color: 'bg-sector-tinturaria'
  },
  {
    id: 'delayed-orders',
    name: 'Encomendas Atrasadas',
    description: 'Lista completa de encomendas com atrasos e impacto por cliente',
    icon: Calendar,
    color: 'bg-status-danger'
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Taxa de cumprimento de prazos, tempo médio de produção',
    icon: BarChart3,
    color: 'bg-status-success'
  },
  {
    id: 'invoicing',
    name: 'Facturação',
    description: 'Quantidade facturada vs em aberto, análise por cliente',
    icon: FileText,
    color: 'bg-sector-expedicao'
  },
  {
    id: 'inventory',
    name: 'Stock e Expedição',
    description: 'Estado do stock em armazém e encomendas prontas para expedição',
    icon: Package,
    color: 'bg-sector-embalagem'
  }
];

export default function Reports() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div 
              key={report.id}
              className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0",
                  report.color
                )}>
                  <report.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                    {report.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {report.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Download className="w-4 h-4" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <FileText className="w-4 h-4" />
                  PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
