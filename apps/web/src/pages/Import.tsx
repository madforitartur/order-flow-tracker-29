import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useImportMutation, useImportsQuery } from '@/hooks/useImports';

export default function Import() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const importMutation = useImportMutation();
  const importsQuery = useImportsQuery();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.match(/\.(xls|xlsx|csv|tsv)$/i)) {
        setUploadedFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;
    await importMutation.mutateAsync(uploadedFile);
    importsQuery.refetch();
  };

  const clearFile = () => {
    setUploadedFile(null);
    importMutation.reset();
  };

  const uploadSuccess = importMutation.isSuccess;

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Upload area */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Importar Ficheiro Excel</h2>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
              isDragging ? "border-primary bg-primary/5" : "border-border",
              uploadedFile ? "bg-muted/30" : "hover:border-muted-foreground/30"
            )}
          >
            {uploadSuccess ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-status-success" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Importação concluída!</p>
                  <p className="text-sm text-muted-foreground">Importação concluída com sucesso</p>
                </div>
                <Button variant="outline" onClick={clearFile} className="mt-2">
                  Importar outro ficheiro
                </Button>
              </div>
            ) : uploadedFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <FileSpreadsheet className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleUpload} disabled={importMutation.isPending} className="gap-2">
                    {importMutation.isPending ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        A processar...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Importar dados
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={clearFile} disabled={importMutation.isPending}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Arraste o ficheiro Excel aqui</p>
                  <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
                </div>
                <label>
                  <input
                    type="file"
                    accept=".xls,.xlsx,.csv,.tsv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button variant="outline" asChild>
                    <span className="cursor-pointer">Selecionar ficheiro</span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Formatos aceites: .xls, .xlsx, .csv, .tsv
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Import history */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Histórico de Importações</h3>
          </div>
          <div className="divide-y divide-border">
            {(importsQuery.data ?? []).map((log) => (
              <div key={log.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    log.status === 'success' ? "bg-status-success/10" :
                    log.status === 'partial' ? "bg-status-warning/10" :
                    log.status === 'processing' ? "bg-status-warning/10" :
                    "bg-status-danger/10"
                  )}>
                    {log.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-status-success" />
                    ) : log.status === 'partial' || log.status === 'processing' ? (
                      <AlertCircle className="w-5 h-5 text-status-warning" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-status-danger" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{log.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(log.importDate), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: pt })}
                    </p>
                    {log.errors && log.errors.length > 0 && (
                      <p className="text-xs text-status-warning mt-1">{log.errors[0]}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{log.recordCount}</p>
                  <p className="text-xs text-muted-foreground">registos</p>
                </div>
              </div>
            ))}
            {importsQuery.data?.length === 0 && (
              <div className="px-6 py-6 text-sm text-muted-foreground text-center">
                Ainda não existem importações registadas.
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
