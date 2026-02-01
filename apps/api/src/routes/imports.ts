import type { FastifyInstance } from 'fastify';
import { db } from '../db';
import { imports } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { config } from '../config';
import { ingestFile, saveUpload, getImportDetail } from '../services/importProcessor';
import { importQueue, startImportWorker } from '../queues/importQueue';

let workerStarted = false;

export function registerImportRoutes(app: FastifyInstance) {
  app.get('/api/imports', async () => {
    const records = await db.select().from(imports).orderBy(desc(imports.uploadedAt)).limit(50);
    return records.map((record) => ({
      id: String(record.id),
      fileName: record.filename,
      importDate: record.uploadedAt.toISOString(),
      recordCount: record.rowsTotal,
      status: record.status === 'done' ? 'success' : record.status,
      errors: record.rowsError > 0 ? [`${record.rowsError} linhas com erro`] : undefined
    }));
  });

  app.get('/api/imports/:id', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    if (Number.isNaN(id)) {
      reply.code(400);
      return { message: 'Invalid import id' };
    }

    const detail = await getImportDetail(id);
    if (!detail) {
      reply.code(404);
      return { message: 'Import not found' };
    }

    return detail;
  });

  app.post('/api/imports', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      reply.code(400);
      return { message: 'File is required' };
    }

    const buffer = await data.toBuffer();
    const { filePath } = await saveUpload(buffer, data.filename);

    if (config.useQueue) {
      if (!workerStarted) {
        startImportWorker();
        workerStarted = true;
      }
      const job = await importQueue.add('import', {
        filename: data.filename,
        filePath,
        sourceSystem: request.headers['x-source-system'] as string | undefined
      });

      return { status: 'queued', jobId: job.id };
    }

    const result = await ingestFile({
      filename: data.filename,
      filePath,
      sourceSystem: request.headers['x-source-system'] as string | undefined
    });

    if (result.status === 'duplicate') {
      const [record] = await db.select().from(imports).where(eq(imports.id, result.importId)).limit(1);
      return {
        status: 'duplicate',
        importId: result.importId,
        fileName: record?.filename
      };
    }

    return { status: 'done', importId: result.importId };
  });
}
