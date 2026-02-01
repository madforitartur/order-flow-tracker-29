import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchImports, uploadImport } from '@/api/imports';

export function useImportsQuery() {
  return useQuery({
    queryKey: ['imports'],
    queryFn: fetchImports
  });
}

export function useImportMutation() {
  return useMutation({
    mutationFn: uploadImport
  });
}
