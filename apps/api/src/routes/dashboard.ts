import type { FastifyInstance } from 'fastify';
import { db } from '../db';
import { sql } from 'drizzle-orm';

function buildDateRange(query: { from?: string; to?: string }) {
  const clauses: any[] = [];
  if (query.from) {
    clauses.push(sql`o.requested_date >= ${query.from}`);
  }
  if (query.to) {
    clauses.push(sql`o.requested_date <= ${query.to}`);
  }
  return clauses.length > 0 ? sql.join(clauses, sql` AND `) : sql`TRUE`;
}

export function registerDashboardRoutes(app: FastifyInstance) {
  app.get('/api/dashboard/kpis', async (request) => {
    const query = request.query as { from?: string; to?: string };
    const range = buildDateRange(query);

    const [row] = await db.execute(sql`
      SELECT
        COUNT(*)::int as total_orders,
        COUNT(*) FILTER (WHERE o.qty_open > 0)::int as active_orders,
        COUNT(*) FILTER (WHERE o.qty_open > 0 AND o.requested_date < NOW())::int as delayed_orders,
        COUNT(*) FILTER (WHERE o.qty_open = 0 AND o.data_ent >= DATE_TRUNC('month', NOW()))::int as completed_this_month,
        COUNT(*) FILTER (WHERE o.qty_open > 0 AND o.requested_date BETWEEN DATE_TRUNC('week', NOW()) AND DATE_TRUNC('week', NOW()) + INTERVAL '6 days')::int as due_this_week,
        COUNT(*) FILTER (WHERE o.qty_open > 0 AND o.requested_date BETWEEN DATE_TRUNC('month', NOW()) AND DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 day')::int as due_this_month,
        COALESCE(SUM(o.felpo_cru + o.tinturaria + o.confeccao_roupoes + o.confeccao_felpos + o.emb_acab), 0)::float as total_quantity_in_production,
        COALESCE(SUM(o.qty_invoiced), 0)::float as total_invoiced,
        COALESCE(SUM(o.qty_open), 0)::float as total_pending,
        COALESCE(SUM(o.qty), 0)::float as total_requested
      FROM orders o
      WHERE ${range}
    `);

    const fulfillmentRate = row.total_requested > 0 ? Math.round((row.total_invoiced / row.total_requested) * 100) : 0;

    return {
      totalOrders: Number(row.total_orders),
      activeOrders: Number(row.active_orders),
      delayedOrders: Number(row.delayed_orders),
      completedThisMonth: Number(row.completed_this_month),
      dueThisWeek: Number(row.due_this_week),
      dueThisMonth: Number(row.due_this_month),
      totalQuantityInProduction: Number(row.total_quantity_in_production),
      totalInvoiced: Number(row.total_invoiced),
      totalPending: Number(row.total_pending),
      fulfillmentRate
    };
  });

  app.get('/api/dashboard/by-status', async () => {
    const rows = await db.execute(sql`
      SELECT
        CASE
          WHEN o.qty_open = 0 THEN 'completed'
          WHEN o.requested_date < NOW() THEN 'delayed'
          WHEN o.felpo_cru > 0 OR o.tinturaria > 0 OR o.confeccao_roupoes > 0 OR o.confeccao_felpos > 0 THEN 'in-progress'
          ELSE 'pending'
        END as status,
        COUNT(*)::int as count
      FROM orders o
      GROUP BY status
    `);

    return rows.map((row: any) => ({
      status: row.status,
      count: Number(row.count)
    }));
  });

  app.get('/api/dashboard/by-client', async () => {
    const rows = await db.execute(sql`
      SELECT COALESCE(o.client_name, o.client_code, 'Sem Cliente') as client_name,
             COUNT(*)::int as order_count,
             COALESCE(SUM(o.qty), 0)::float as total_quantity
      FROM orders o
      GROUP BY client_name
      ORDER BY order_count DESC
      LIMIT 8
    `);

    return rows.map((row: any) => ({
      clientName: row.client_name,
      orderCount: Number(row.order_count),
      totalQuantity: Number(row.total_quantity)
    }));
  });

  app.get('/api/dashboard/sectors-overview', async () => {
    const rows = await db.execute(sql`
      SELECT
        CASE
          WHEN o.stock_cx > o.qty_invoiced THEN 'expedicao'
          WHEN o.emb_acab > o.stock_cx THEN 'embalagem'
          WHEN (o.confeccao_roupoes + o.confeccao_felpos) > o.emb_acab THEN 'confeccao'
          WHEN o.tinturaria > (o.confeccao_roupoes + o.confeccao_felpos) THEN 'tinturaria'
          WHEN o.felpo_cru > o.tinturaria THEN 'felpo-cru'
          WHEN o.data_tec IS NOT NULL THEN 'tecelagem'
          ELSE 'tecelagem'
        END as sector,
        COALESCE(SUM(o.qty_open), 0)::float as current_quantity,
        COUNT(*)::int as order_count,
        COALESCE(AVG(EXTRACT(day FROM (o.requested_date - o.issue_date))), 0)::float as avg_days
      FROM orders o
      GROUP BY sector
      ORDER BY sector
    `);

    return rows.map((row: any) => {
      const currentQuantity = Number(row.current_quantity);
      return {
        sector: row.sector,
        currentQuantity,
        orderCount: Number(row.order_count),
        avgProcessingDays: Math.round(Number(row.avg_days)),
        occupancyRate: Math.min(100, Math.round((currentQuantity / 10000) * 100))
      };
    });
  });

  app.get('/api/dashboard/alerts', async () => {
    const rows = await db.execute(sql`
      SELECT a.id, a.type, a.severity, a.order_id, a.sector_id, a.message, a.created_at, a.resolved_at,
             o.doc_nr, o.client_name, o.requested_date, o.qty_open
      FROM alerts a
      LEFT JOIN orders o ON o.id = a.order_id
      WHERE a.resolved_at IS NULL
      ORDER BY a.created_at DESC
      LIMIT 20
    `);

    return rows.map((row: any) => ({
      id: String(row.id),
      type: row.type,
      severity: row.severity,
      orderId: row.order_id ? String(row.order_id) : null,
      sectorId: row.sector_id ? String(row.sector_id) : null,
      message: row.message,
      createdAt: new Date(row.created_at).toISOString(),
      resolvedAt: row.resolved_at ? new Date(row.resolved_at).toISOString() : null,
      orderDocument: row.doc_nr ?? null,
      clientName: row.client_name ?? null,
      dueDate: row.requested_date ? new Date(row.requested_date).toISOString() : null,
      openQuantity: row.qty_open ? Number(row.qty_open) : null
    }));
  });
}
