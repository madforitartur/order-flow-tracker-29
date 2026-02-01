import type { FastifyInstance } from 'fastify';
import { db } from '../db';
import { orders, orderStatus, orderSectorState, sectors } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

function mapOrder(row: any) {
  return {
    id: String(row.id),
    nrDocumento: row.doc_nr,
    terceiro: row.client_name ?? row.client_code ?? '',
    dataEmissao: row.issue_date ? new Date(row.issue_date).toISOString() : null,
    dataPedida: row.requested_date ? new Date(row.requested_date).toISOString() : null,
    item: row.item_nr,
    po: row.po ?? '',
    codArtigo: row.article ?? '',
    referencia: row.reference ?? '',
    cor: row.color_code ?? '',
    descricaoCor: row.color_name ?? '',
    tam: row.size_code ?? '',
    familia: row.family ?? '',
    descricaoTam: row.size_name ?? '',
    ean: row.ean ?? '',
    qtdPedida: Number(row.qty ?? 0),
    dataTec: row.data_tec ? new Date(row.data_tec).toISOString() : null,
    felpoCru: Number(row.felpo_cru ?? 0),
    dataFelpoCru: row.data_felpo_cru ? new Date(row.data_felpo_cru).toISOString() : null,
    tinturaria: Number(row.tinturaria ?? 0),
    dataTint: row.data_tint ? new Date(row.data_tint).toISOString() : null,
    confeccaoRoupoes: Number(row.confeccao_roupoes ?? 0),
    confeccaoFelpos: Number(row.confeccao_felpos ?? 0),
    dataConf: row.data_conf ? new Date(row.data_conf).toISOString() : null,
    embAcab: Number(row.emb_acab ?? 0),
    dataArmExp: row.data_arm_exp ? new Date(row.data_arm_exp).toISOString() : null,
    stockCx: Number(row.stock_cx ?? 0),
    dataEnt: row.data_ent ? new Date(row.data_ent).toISOString() : null,
    dataEspecial: row.data_especial ? new Date(row.data_especial).toISOString() : null,
    dataPrinter: row.data_printer ? new Date(row.data_printer).toISOString() : null,
    dataDebuxo: row.data_debuxo ? new Date(row.data_debuxo).toISOString() : null,
    dataAmostras: row.data_amostras ? new Date(row.data_amostras).toISOString() : null,
    dataBordados: row.data_bordados ? new Date(row.data_bordados).toISOString() : null,
    facturada: Number(row.qty_invoiced ?? 0),
    emAberto: Number(row.qty_open ?? 0)
  };
}

function buildFilters(query: Record<string, string | undefined>) {
  const clauses: any[] = [];

  if (query.search) {
    const term = `%${query.search}%`;
    clauses.push(sql`(o.doc_nr ILIKE ${term} OR o.client_name ILIKE ${term} OR o.po ILIKE ${term} OR o.reference ILIKE ${term})`);
  }

  if (query.client) {
    clauses.push(sql`o.client_name = ${query.client}`);
  }

  if (query.family) {
    clauses.push(sql`o.family = ${query.family}`);
  }

  if (query.from) {
    clauses.push(sql`o.issue_date >= ${query.from}`);
  }

  if (query.to) {
    clauses.push(sql`o.issue_date <= ${query.to}`);
  }

  if (query.status && query.status !== 'all') {
    clauses.push(sql`
      CASE
        WHEN o.qty_open = 0 THEN 'completed'
        WHEN o.requested_date < NOW() THEN 'delayed'
        WHEN o.felpo_cru > 0 OR o.tinturaria > 0 OR o.confeccao_roupoes > 0 OR o.confeccao_felpos > 0 THEN 'in-progress'
        ELSE 'pending'
      END = ${query.status}
    `);
  }

  if (query.sector && query.sector !== 'all') {
    clauses.push(sql`
      CASE
        WHEN o.stock_cx > o.qty_invoiced THEN 'expedicao'
        WHEN o.emb_acab > o.stock_cx THEN 'embalagem'
        WHEN (o.confeccao_roupoes + o.confeccao_felpos) > o.emb_acab THEN 'confeccao'
        WHEN o.tinturaria > (o.confeccao_roupoes + o.confeccao_felpos) THEN 'tinturaria'
        WHEN o.felpo_cru > o.tinturaria THEN 'felpo-cru'
        WHEN o.data_tec IS NOT NULL THEN 'tecelagem'
        ELSE NULL
      END = ${query.sector}
    `);
  }

  return clauses.length > 0 ? sql.join(clauses, sql` AND `) : sql`TRUE`;
}

export function registerOrderRoutes(app: FastifyInstance) {
  app.get('/api/orders', async (request) => {
    const query = request.query as {
      search?: string;
      status?: string;
      client?: string;
      family?: string;
      sector?: string;
      from?: string;
      to?: string;
      page?: string;
      pageSize?: string;
      sort?: string;
      direction?: string;
    };

    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 25);
    const offset = (page - 1) * pageSize;
    const filters = buildFilters(query);

    const sortField = query.sort ?? 'requested_date';
    const direction = query.direction?.toLowerCase() === 'desc' ? sql`DESC` : sql`ASC`;
    const sortColumn = ['doc_nr', 'client_name', 'issue_date', 'requested_date', 'qty', 'qty_open'].includes(sortField)
      ? sql.identifier(sortField)
      : sql.identifier('requested_date');

    const [{ count }] = await db.execute(sql`
      SELECT COUNT(*)::int as count
      FROM orders o
      WHERE ${filters}
    `);

    const rows = await db.execute(sql`
      SELECT o.*
      FROM orders o
      WHERE ${filters}
      ORDER BY ${sortColumn} ${direction}
      LIMIT ${pageSize} OFFSET ${offset}
    `);

    return {
      data: rows.map(mapOrder),
      page,
      pageSize,
      total: Number(count)
    };
  });

  app.get('/api/orders/:id', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    if (Number.isNaN(id)) {
      reply.code(400);
      return { message: 'Invalid order id' };
    }

    const [row] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!row) {
      reply.code(404);
      return { message: 'Order not found' };
    }

    return mapOrder(row);
  });

  app.get('/api/orders/:id/timeline', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    if (Number.isNaN(id)) {
      reply.code(400);
      return { message: 'Invalid order id' };
    }

    const statusHistory = await db.execute(sql`
      SELECT id, status, status_reason, updated_at, updated_by
      FROM order_status
      WHERE order_id = ${id}
      ORDER BY updated_at DESC
    `);

    const sectorHistory = await db.execute(sql`
      SELECT oss.id, oss.sector_id, s.code as sector_code, s.name as sector_name,
             oss.state, oss.start_date, oss.due_date, oss.end_date, oss.notes,
             oss.updated_at, oss.updated_by
      FROM order_sector_state oss
      JOIN sectors s ON s.id = oss.sector_id
      WHERE oss.order_id = ${id}
      ORDER BY oss.updated_at DESC
    `);

    return {
      orderId: String(id),
      statusHistory: statusHistory.map((row: any) => ({
        id: String(row.id),
        status: row.status,
        statusReason: row.status_reason,
        updatedAt: new Date(row.updated_at).toISOString(),
        updatedBy: row.updated_by
      })),
      sectorHistory: sectorHistory.map((row: any) => ({
        id: String(row.id),
        sectorId: String(row.sector_id),
        sectorCode: row.sector_code,
        sectorName: row.sector_name,
        state: row.state,
        startDate: row.start_date ? new Date(row.start_date).toISOString() : null,
        dueDate: row.due_date ? new Date(row.due_date).toISOString() : null,
        endDate: row.end_date ? new Date(row.end_date).toISOString() : null,
        notes: row.notes,
        updatedAt: new Date(row.updated_at).toISOString(),
        updatedBy: row.updated_by
      }))
    };
  });
}
