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

export function registerReportsRoutes(app: FastifyInstance) {
  app.get('/api/reports/late-orders', async (request) => {
    const query = request.query as { from?: string; to?: string };
    const range = buildDateRange(query);

    const rows = await db.execute(sql`
      SELECT o.*
      FROM orders o
      WHERE o.qty_open > 0 AND o.requested_date < NOW() AND ${range}
      ORDER BY o.requested_date ASC
      LIMIT 200
    `);

    return rows.map((row: any) => ({
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
    }));
  });
}
