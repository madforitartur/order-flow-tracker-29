import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import chardet from 'chardet';
import iconv from 'iconv-lite';
import { parse } from 'csv-parse/sync';
import xlsx from 'xlsx';
import { db } from '../db';
import { alerts, importRows, imports, orders, orderStatus, orderSectorState } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { ensureSectors, getSectorIdByCode } from './seed';
import { config } from '../config';
import { z } from 'zod';

const dateField = z.union([z.string(), z.date(), z.number()]).optional();

const rowSchema = z.object({
  doc_nr: z.string().min(1),
  item_nr: z.coerce.number(),
  client_code: z.string().optional(),
  client_name: z.string().optional(),
  po: z.string().optional(),
  article: z.string().optional(),
  qty: z.coerce.number().default(0),
  unit: z.string().optional(),
  issue_date: dateField,
  requested_date: dateField,
  family: z.string().optional(),
  reference: z.string().optional(),
  color_code: z.string().optional(),
  color_name: z.string().optional(),
  size_code: z.string().optional(),
  size_name: z.string().optional(),
  ean: z.string().optional(),
  qty_invoiced: z.coerce.number().optional(),
  qty_open: z.coerce.number().optional(),
  data_tec: dateField,
  data_felpo_cru: dateField,
  data_tint: dateField,
  data_conf: dateField,
  data_arm_exp: dateField,
  data_ent: dateField,
  data_especial: dateField,
  data_printer: dateField,
  data_debuxo: dateField,
  data_amostras: dateField,
  data_bordados: dateField,
  felpo_cru: z.coerce.number().optional(),
  tinturaria: z.coerce.number().optional(),
  confeccao_roupoes: z.coerce.number().optional(),
  confeccao_felpos: z.coerce.number().optional(),
  emb_acab: z.coerce.number().optional(),
  stock_cx: z.coerce.number().optional()
});

function normalizeKey(key: string) {
  return key
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9_]/g, '');
}

function parseDate(value?: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
  }
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function detectDelimiter(sample: string) {
  if (sample.includes('\t')) return '\t';
  if (sample.includes(';')) return ';';
  return ',';
}

function mapRow(raw: Record<string, unknown>) {
  const normalized: Record<string, unknown> = {};
  Object.entries(raw).forEach(([key, value]) => {
    normalized[normalizeKey(key)] = value;
  });
  return normalized;
}

async function parseFile(filePath: string, filename: string) {
  const buffer = await fs.readFile(filePath);
  const ext = path.extname(filename).toLowerCase();

  if (ext === '.xls' || ext === '.xlsx') {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return xlsx.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[];
  }

  const encoding = chardet.detect(buffer) || 'utf-8';
  const decoded = iconv.decode(buffer, encoding as string);
  const [headerLine] = decoded.split(/\r?\n/);
  const delimiter = detectDelimiter(headerLine ?? '');

  return parse(decoded, {
    columns: true,
    skip_empty_lines: true,
    delimiter
  }) as Record<string, unknown>[];
}

export async function ingestFile({ filename, filePath, sourceSystem }: { filename: string; filePath: string; sourceSystem?: string }) {
  await ensureSectors();
  const buffer = await fs.readFile(filePath);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');

  const existing = await db.select().from(imports).where(eq(imports.hash, hash)).limit(1);
  if (existing.length > 0) {
    return { status: 'duplicate', importId: existing[0].id };
  }

  const [importRecord] = await db.insert(imports).values({
    filename,
    status: 'processing',
    hash,
    sourceSystem
  }).returning();

  const rows = await parseFile(filePath, filename);

  let rowsOk = 0;
  let rowsError = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const rawRow = rows[index];
    const normalized = mapRow(rawRow);
    const parsed = rowSchema.safeParse(normalized);

    if (!parsed.success) {
      rowsError += 1;
      await db.insert(importRows).values({
        importId: importRecord.id,
        rowIndex: index + 1,
        rawData: normalized,
        errors: parsed.error.errors.map((err) => err.message)
      });
      continue;
    }

    const data = parsed.data;
    const issueDate = parseDate(data.issue_date);
    const requestedDate = parseDate(data.requested_date);

    const orderValues = {
      docNr: data.doc_nr,
      itemNr: data.item_nr,
      clientCode: data.client_code ?? null,
      clientName: data.client_name ?? null,
      po: data.po ?? null,
      article: data.article ?? null,
      qty: data.qty,
      unit: data.unit ?? null,
      issueDate,
      requestedDate,
      family: data.family ?? null,
      reference: data.reference ?? null,
      colorCode: data.color_code ?? null,
      colorName: data.color_name ?? null,
      sizeCode: data.size_code ?? null,
      sizeName: data.size_name ?? null,
      ean: data.ean ?? null,
      qtyInvoiced: data.qty_invoiced ?? 0,
      qtyOpen: data.qty_open ?? 0,
      felpoCru: data.felpo_cru ?? 0,
      tinturaria: data.tinturaria ?? 0,
      confeccaoRoupoes: data.confeccao_roupoes ?? 0,
      confeccaoFelpos: data.confeccao_felpos ?? 0,
      embAcab: data.emb_acab ?? 0,
      stockCx: data.stock_cx ?? 0,
      dataTec: parseDate(data.data_tec),
      dataFelpoCru: parseDate(data.data_felpo_cru),
      dataTint: parseDate(data.data_tint),
      dataConf: parseDate(data.data_conf),
      dataArmExp: parseDate(data.data_arm_exp),
      dataEnt: parseDate(data.data_ent),
      dataEspecial: parseDate(data.data_especial),
      dataPrinter: parseDate(data.data_printer),
      dataDebuxo: parseDate(data.data_debuxo),
      dataAmostras: parseDate(data.data_amostras),
      dataBordados: parseDate(data.data_bordados)
    };

    const [orderRecord] = await db
      .insert(orders)
      .values({
        ...orderValues,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [orders.docNr, orders.itemNr],
        set: {
          ...orderValues,
          updatedAt: new Date()
        }
      })
      .returning();

    const openQty = Number(orderRecord.qtyOpen ?? 0);
    const status = openQty === 0 ? 'completed' : (requestedDate && requestedDate < new Date() ? 'delayed' : 'in-progress');

    await db.insert(orderStatus).values({
      orderId: orderRecord.id,
      status,
      statusReason: status === 'delayed' ? 'Prazo ultrapassado' : null,
      updatedAt: new Date(),
      sourceImportId: importRecord.id
    });

    const stockCx = Number(orderRecord.stockCx ?? 0);
    const embAcab = Number(orderRecord.embAcab ?? 0);
    const confeccaoRoupoes = Number(orderRecord.confeccaoRoupoes ?? 0);
    const confeccaoFelpos = Number(orderRecord.confeccaoFelpos ?? 0);
    const tinturaria = Number(orderRecord.tinturaria ?? 0);
    const felpoCru = Number(orderRecord.felpoCru ?? 0);

    const sectorCode = stockCx > 0 ? 'expedicao'
      : embAcab > 0 ? 'embalagem'
      : confeccaoRoupoes > 0 || confeccaoFelpos > 0 ? 'confeccao'
      : tinturaria > 0 ? 'tinturaria'
      : felpoCru > 0 ? 'felpo-cru'
      : 'tecelagem';

    const sectorId = await getSectorIdByCode(sectorCode);
    if (sectorId) {
      await db.insert(orderSectorState).values({
        orderId: orderRecord.id,
        sectorId,
        state: status === 'completed' ? 'done' : status === 'delayed' ? 'late' : 'on_time',
        startDate: issueDate,
        dueDate: requestedDate,
        endDate: status === 'completed' ? new Date() : null,
        updatedAt: new Date(),
        sourceImportId: importRecord.id
      });
    }

    if (requestedDate && requestedDate < new Date() && openQty > 0) {
      await db.insert(alerts).values({
        type: 'late-order',
        severity: 'high',
        orderId: orderRecord.id,
        message: `Encomenda ${orderRecord.docNr} atrasada`,
        createdAt: new Date()
      });
    }

    rowsOk += 1;
  }

  await db.update(imports)
    .set({
      status: rowsError > 0 ? (rowsOk > 0 ? 'partial' : 'error') : 'done',
      rowsTotal: rows.length,
      rowsOk,
      rowsError
    })
    .where(eq(imports.id, importRecord.id));

  return { status: 'done', importId: importRecord.id };
}

export async function saveUpload(fileBuffer: Buffer, filename: string) {
  await fs.mkdir(config.uploadsDir, { recursive: true });
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  const ext = path.extname(filename);
  const savedName = `${hash}${ext}`;
  const filePath = path.join(config.uploadsDir, savedName);
  await fs.writeFile(filePath, fileBuffer);
  return { filePath, hash };
}

export async function getImportDetail(importId: number) {
  const [record] = await db.select().from(imports).where(eq(imports.id, importId)).limit(1);
  if (!record) return null;
  const errors = await db.select({ errors: importRows.errors })
    .from(importRows)
    .where(eq(importRows.importId, importId))
    .orderBy(desc(importRows.rowIndex))
    .limit(50);

  return {
    id: String(record.id),
    fileName: record.filename,
    importDate: record.uploadedAt.toISOString(),
    recordCount: record.rowsTotal,
    status: record.status,
    errors: errors.flatMap((row) => row.errors ?? [])
  };
}
