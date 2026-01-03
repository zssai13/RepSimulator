'use client';

import toast from 'react-hot-toast';
import BucketCard from './BucketCard';
import { useKnowledgeStore, bucketConfigs } from '@/lib/store';
import { BucketType } from '@/types';

export default function KnowledgeBuckets() {
  const { buckets, uploadFiles, setStatus, setPlaybookUrl, clearBucket } = useKnowledgeStore();

  const handleUpload = async (bucketType: BucketType, files: File[]) => {
    // Add files to state
    uploadFiles(bucketType, files);

    const config = bucketConfigs.find(c => c.type === bucketType);
    const bucketName = config?.title || bucketType;

    toast.loading(`Processing ${files.length} file(s)...`, { id: `upload-${bucketType}` });

    try {
      // Read file contents
      const documents = await Promise.all(
        files.map(async (file) => {
          const content = await file.text();
          return {
            filename: file.name,
            content,
          };
        })
      );

      if (config?.processingType === 'rag') {
        // Website & Documentation - call /api/ingest
        const response = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bucket: bucketType,
            documents,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to ingest documents');
        }

        toast.success(`${bucketName}: ${data.chunksCreated} chunks indexed`, { id: `upload-${bucketType}` });
        setStatus(bucketType, 'ready');

      } else if (config?.processingType === 'extraction') {
        // Transcripts & Tickets - call /api/extract
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bucket: bucketType,
            documents,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to extract playbook');
        }

        toast.success(`${bucketName}: Playbook extracted`, { id: `upload-${bucketType}` });
        
        // Set the playbook URL for download
        if (data.playbookUrl) {
          setPlaybookUrl(bucketType, data.playbookUrl);
        } else {
          setStatus(bucketType, 'ready');
        }
      }
      
    } catch (error) {
      console.error(`[${bucketType}] Processing error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process files';
      toast.error(`${bucketName}: ${errorMessage}`, { id: `upload-${bucketType}` });
      setStatus(bucketType, 'error', errorMessage);
    }
  };

  const handleClear = (bucketType: BucketType) => {
    const config = bucketConfigs.find(c => c.type === bucketType);
    clearBucket(bucketType);
    toast.success(`${config?.title || bucketType} cleared`);
  };

  return (
    <div className="space-y-4">
      {bucketConfigs.map((config) => {
        const bucketState = buckets[config.type];
        
        return (
          <BucketCard
            key={config.type}
            title={config.title}
            description={config.description}
            acceptedMimeTypes={config.acceptedMimeTypes}
            fileLimit={config.fileLimit}
            status={bucketState.status}
            fileCount={bucketState.fileCount}
            errorMessage={bucketState.errorMessage}
            onUpload={(files) => handleUpload(config.type, files)}
            onClear={() => handleClear(config.type)}
            downloadUrl={bucketState.playbookUrl}
          />
        );
      })}
      
      {/* Knowledge Status Summary */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500 font-medium mb-2">Knowledge Status</p>
        <div className="flex flex-wrap gap-2">
          {bucketConfigs.map((config) => {
            const state = buckets[config.type];
            const isActive = state.status === 'ready';
            const isProcessing = state.status === 'processing';
            const hasError = state.status === 'error';
            
            return (
              <span
                key={config.type}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                  isActive 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : isProcessing
                    ? 'bg-amber-100 text-amber-700'
                    : hasError
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isProcessing && <span className="animate-spin">◐</span>}
                {isActive && '✓'}
                {hasError && '✕'}
                {!isActive && !isProcessing && !hasError && '○'}
                {' '}{config.title}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
