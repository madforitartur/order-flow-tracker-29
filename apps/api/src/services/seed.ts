import { db } from '../db';
import { sectors } from '../db/schema';
import { eq } from 'drizzle-orm';

const defaultSectors = [
  { code: 'tecelagem', name: 'Tecelagem', orderIndex: 1 },
  { code: 'felpo-cru', name: 'Felpo Cru', orderIndex: 2 },
  { code: 'tinturaria', name: 'Tinturaria', orderIndex: 3 },
  { code: 'confeccao', name: 'Confecção', orderIndex: 4 },
  { code: 'embalagem', name: 'Embalagem/Acab.', orderIndex: 5 },
  { code: 'expedicao', name: 'Expedição', orderIndex: 6 }
];

export async function ensureSectors() {
  const existing = await db.select().from(sectors).limit(1);
  if (existing.length > 0) return;

  await db.insert(sectors).values(defaultSectors);
}

export async function getSectorIdByCode(code: string) {
  const [row] = await db.select().from(sectors).where(eq(sectors.code, code)).limit(1);
  return row?.id ?? null;
}
