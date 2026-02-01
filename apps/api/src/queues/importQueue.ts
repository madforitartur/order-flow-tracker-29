import { Queue, Worker } from 'bullmq';
import { config } from '../config';
import { ingestFile } from '../services/importProcessor';

const connection = {
  connection: { url: config.redisUrl }
};

export const importQueue = new Queue('imports', connection);

export function startImportWorker() {
  return new Worker('imports', async (job) => {
    const { filename, filePath, sourceSystem } = job.data as { filename: string; filePath: string; sourceSystem?: string };
    await ingestFile({ filename, filePath, sourceSystem });
  }, connection);
}
