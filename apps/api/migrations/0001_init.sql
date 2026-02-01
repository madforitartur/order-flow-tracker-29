CREATE TABLE IF NOT EXISTS imports (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL,
  rows_total INTEGER NOT NULL DEFAULT 0,
  rows_ok INTEGER NOT NULL DEFAULT 0,
  rows_error INTEGER NOT NULL DEFAULT 0,
  hash TEXT NOT NULL,
  source_system TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS imports_hash_unique ON imports(hash);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  doc_nr TEXT NOT NULL,
  item_nr INTEGER NOT NULL,
  client_code TEXT,
  client_name TEXT,
  po TEXT,
  article TEXT,
  qty NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit TEXT,
  issue_date TIMESTAMPTZ,
  requested_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  family TEXT,
  reference TEXT,
  color_code TEXT,
  color_name TEXT,
  size_code TEXT,
  size_name TEXT,
  ean TEXT,
  qty_invoiced NUMERIC(12,2) NOT NULL DEFAULT 0,
  qty_open NUMERIC(12,2) NOT NULL DEFAULT 0,
  production_started BOOLEAN NOT NULL DEFAULT false,
  felpo_cru NUMERIC(12,2) NOT NULL DEFAULT 0,
  tinturaria NUMERIC(12,2) NOT NULL DEFAULT 0,
  confeccao_roupoes NUMERIC(12,2) NOT NULL DEFAULT 0,
  confeccao_felpos NUMERIC(12,2) NOT NULL DEFAULT 0,
  emb_acab NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock_cx NUMERIC(12,2) NOT NULL DEFAULT 0,
  data_tec TIMESTAMPTZ,
  data_felpo_cru TIMESTAMPTZ,
  data_tint TIMESTAMPTZ,
  data_conf TIMESTAMPTZ,
  data_arm_exp TIMESTAMPTZ,
  data_ent TIMESTAMPTZ,
  data_especial TIMESTAMPTZ,
  data_printer TIMESTAMPTZ,
  data_debuxo TIMESTAMPTZ,
  data_amostras TIMESTAMPTZ,
  data_bordados TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS orders_doc_item_idx ON orders(doc_nr, item_nr);
CREATE UNIQUE INDEX IF NOT EXISTS orders_doc_item_unique ON orders(doc_nr, item_nr);
CREATE INDEX IF NOT EXISTS orders_requested_date_idx ON orders(requested_date);

CREATE TABLE IF NOT EXISTS order_status (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  status TEXT NOT NULL,
  status_reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT,
  source_import_id INTEGER REFERENCES imports(id)
);

CREATE INDEX IF NOT EXISTS order_status_order_updated_idx ON order_status(order_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS sectors (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS order_sector_state (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  sector_id INTEGER NOT NULL REFERENCES sectors(id),
  state TEXT NOT NULL,
  start_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT,
  source_import_id INTEGER REFERENCES imports(id)
);

CREATE INDEX IF NOT EXISTS order_sector_state_order_sector_updated_idx ON order_sector_state(order_id, sector_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  order_id INTEGER REFERENCES orders(id),
  sector_id INTEGER REFERENCES sectors(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS import_rows (
  id SERIAL PRIMARY KEY,
  import_id INTEGER NOT NULL REFERENCES imports(id),
  row_index INTEGER NOT NULL,
  raw_data JSONB NOT NULL,
  errors TEXT[]
);
