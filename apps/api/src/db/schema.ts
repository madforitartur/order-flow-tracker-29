import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  index,
  jsonb,
  varchar,
  uniqueIndex
} from 'drizzle-orm/pg-core';

export const imports = pgTable('imports', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
  status: text('status').notNull(),
  rowsTotal: integer('rows_total').default(0).notNull(),
  rowsOk: integer('rows_ok').default(0).notNull(),
  rowsError: integer('rows_error').default(0).notNull(),
  hash: text('hash').notNull(),
  sourceSystem: text('source_system')
}, (table) => ({
  hashIdx: uniqueIndex('imports_hash_unique').on(table.hash)
}));

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  docNr: text('doc_nr').notNull(),
  itemNr: integer('item_nr').notNull(),
  clientCode: text('client_code'),
  clientName: text('client_name'),
  po: text('po'),
  article: text('article'),
  qty: numeric('qty', { precision: 12, scale: 2 }).default('0').notNull(),
  unit: text('unit'),
  issueDate: timestamp('issue_date', { withTimezone: true }),
  requestedDate: timestamp('requested_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  family: text('family'),
  reference: text('reference'),
  colorCode: text('color_code'),
  colorName: text('color_name'),
  sizeCode: text('size_code'),
  sizeName: text('size_name'),
  ean: text('ean'),
  qtyInvoiced: numeric('qty_invoiced', { precision: 12, scale: 2 }).default('0').notNull(),
  qtyOpen: numeric('qty_open', { precision: 12, scale: 2 }).default('0').notNull(),
  productionStarted: boolean('production_started').default(false).notNull(),
  felpoCru: numeric('felpo_cru', { precision: 12, scale: 2 }).default('0').notNull(),
  tinturaria: numeric('tinturaria', { precision: 12, scale: 2 }).default('0').notNull(),
  confeccaoRoupoes: numeric('confeccao_roupoes', { precision: 12, scale: 2 }).default('0').notNull(),
  confeccaoFelpos: numeric('confeccao_felpos', { precision: 12, scale: 2 }).default('0').notNull(),
  embAcab: numeric('emb_acab', { precision: 12, scale: 2 }).default('0').notNull(),
  stockCx: numeric('stock_cx', { precision: 12, scale: 2 }).default('0').notNull(),
  dataTec: timestamp('data_tec', { withTimezone: true }),
  dataFelpoCru: timestamp('data_felpo_cru', { withTimezone: true }),
  dataTint: timestamp('data_tint', { withTimezone: true }),
  dataConf: timestamp('data_conf', { withTimezone: true }),
  dataArmExp: timestamp('data_arm_exp', { withTimezone: true }),
  dataEnt: timestamp('data_ent', { withTimezone: true }),
  dataEspecial: timestamp('data_especial', { withTimezone: true }),
  dataPrinter: timestamp('data_printer', { withTimezone: true }),
  dataDebuxo: timestamp('data_debuxo', { withTimezone: true }),
  dataAmostras: timestamp('data_amostras', { withTimezone: true }),
  dataBordados: timestamp('data_bordados', { withTimezone: true })
}, (table) => ({
  docItemIdx: index('orders_doc_item_idx').on(table.docNr, table.itemNr),
  docItemUnique: uniqueIndex('orders_doc_item_unique').on(table.docNr, table.itemNr),
  requestedDateIdx: index('orders_requested_date_idx').on(table.requestedDate)
}));

export const orderStatus = pgTable('order_status', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  status: text('status').notNull(),
  statusReason: text('status_reason'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  updatedBy: text('updated_by'),
  sourceImportId: integer('source_import_id').references(() => imports.id)
}, (table) => ({
  orderUpdatedIdx: index('order_status_order_updated_idx').on(table.orderId, table.updatedAt)
}));

export const sectors = pgTable('sectors', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull(),
  name: text('name').notNull(),
  orderIndex: integer('order_index').notNull()
});

export const orderSectorState = pgTable('order_sector_state', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  sectorId: integer('sector_id').references(() => sectors.id).notNull(),
  state: text('state').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }),
  dueDate: timestamp('due_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  notes: text('notes'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  updatedBy: text('updated_by'),
  sourceImportId: integer('source_import_id').references(() => imports.id)
}, (table) => ({
  orderSectorUpdatedIdx: index('order_sector_state_order_sector_updated_idx').on(table.orderId, table.sectorId, table.updatedAt)
}));

export const alerts = pgTable('alerts', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  severity: text('severity').notNull(),
  orderId: integer('order_id').references(() => orders.id),
  sectorId: integer('sector_id').references(() => sectors.id),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true })
});

export const importRows = pgTable('import_rows', {
  id: serial('id').primaryKey(),
  importId: integer('import_id').references(() => imports.id).notNull(),
  rowIndex: integer('row_index').notNull(),
  rawData: jsonb('raw_data').notNull(),
  errors: text('errors').array()
});
