import type { FastifyInstance } from 'fastify';
import { db } from '../db';
import { sql } from 'drizzle-orm';

export function registerStatisticsRoutes(app: FastifyInstance) {
  app.get('/api/statistics/trends', async (request) => {
    const query = request.query as { metric?: string; from?: string; to?: string };
    const metric = query.metric ?? 'orders';
    const from = query.from ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const to = query.to ?? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();

    const rows = await db.execute(sql`
      SELECT DATE_TRUNC('day', o.issue_date) as day,
        COUNT(*)::int as value
      FROM orders o
      WHERE o.issue_date BETWEEN ${from} AND ${to}
      GROUP BY day
      ORDER BY day
    `);

    if (metric === 'delayed') {
      const delayedRows = await db.execute(sql`
        SELECT DATE_TRUNC('day', o.requested_date) as day,
          COUNT(*)::int as value
        FROM orders o
        WHERE o.requested_date BETWEEN ${from} AND ${to}
          AND o.qty_open > 0
          AND o.requested_date < NOW()
        GROUP BY day
        ORDER BY day
      `);

      return delayedRows.map((row: any) => ({
        date: new Date(row.day).toISOString(),
        value: Number(row.value)
      }));
    }

    return rows.map((row: any) => ({
      date: new Date(row.day).toISOString(),
      value: Number(row.value)
    }));
  });

  app.get('/api/statistics/by-family', async () => {
    const rows = await db.execute(sql`
      SELECT COALESCE(o.family, 'Sem Família') as family,
             COUNT(*)::int as order_count,
             COALESCE(SUM(o.qty), 0)::float as total_quantity
      FROM orders o
      GROUP BY family
      ORDER BY order_count DESC
    `);

    return rows.map((row: any) => ({
      family: row.family,
      orderCount: Number(row.order_count),
      totalQuantity: Number(row.total_quantity)
    }));
  });
}
