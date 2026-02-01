import { z } from 'zod';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function apiFetch<T>(path: string, options: RequestInit = {}, schema?: z.ZodSchema<T>) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with ${response.status}`);
  }

  if (response.status === 204) return null as T;

  const data = await response.json();
  if (schema) {
    return schema.parse(data);
  }
  return data as T;
}

export async function apiUpload<T>(path: string, file: File, schema?: z.ZodSchema<T>) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Upload failed with ${response.status}`);
  }

  const data = await response.json();
  if (schema) {
    return schema.parse(data);
  }
  return data as T;
}
