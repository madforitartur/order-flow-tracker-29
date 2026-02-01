import { importLogsSchema, importDetailSchema } from '@order-flow/shared';
import { apiFetch, apiUpload } from './client';

export async function fetchImports() {
  return apiFetch('/api/imports', {}, importLogsSchema);
}

export async function fetchImportDetail(id: string) {
  return apiFetch(`/api/imports/${id}`, {}, importDetailSchema);
}

export async function uploadImport(file: File) {
  return apiUpload('/api/imports', file);
}
