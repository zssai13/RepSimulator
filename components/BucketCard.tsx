'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { BucketStatus } from '@/types';

interface BucketCardProps {
  title: string;
  description: string;
  acceptedMimeTypes: Record<string, string[]>;
  fileLimit?: number;
  status: BucketStatus;
  fileCount: number;
  errorMessage?: string;
  onUpload: (files: File[]) => void;
  onClear: () => void;
  downloadUrl?: string;
}

const statusConfig: Record<BucketStatus, { color: string; bgColor: string; label: string; icon: string }> = {
  empty: { 
    color: 'text-slate-500', 
    bgColor: 'bg-slate-100', 
    label: 'No files', 
    icon: '○' 
  },
  processing: { 
    color: 'text-amber-700', 
    bgColor: 'bg-amber-100', 
    label: 'Processing...', 
    icon: '◐' 
  },
  ready: { 
    color: 'text-emerald-700', 
    bgColor: 'bg-emerald-100', 
    label: 'Ready', 
    icon: '●' 
  },
  error: { 
    color: 'text-red-700', 
    bgColor: 'bg-red-100', 
    label: 'Error', 
    icon: '✕' 
  },
};

export default function BucketCard({
  title,
  description,
  acceptedMimeTypes,
  fileLimit,
  status,
  fileCount,
  errorMessage,
  onUpload,
  onClear,
  downloadUrl,
}: BucketCardProps) {
  const statusInfo = statusConfig[status];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      // Check file limit
      if (fileLimit && fileCount + acceptedFiles.length > fileLimit) {
        const allowedCount = fileLimit - fileCount;
        if (allowedCount <= 0) {
          alert(`File limit reached (${fileLimit} files max)`);
          return;
        }
        // Only take files up to the limit
        onUpload(acceptedFiles.slice(0, allowedCount));
        alert(`Only ${allowedCount} files added. Limit is ${fileLimit} files.`);
      } else {
        onUpload(acceptedFiles);
      }
    }
  }, [onUpload, fileLimit, fileCount]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedMimeTypes,
    disabled: status === 'processing',
  });

  // Get accepted file extensions for display
  const acceptedExtensions = Object.values(acceptedMimeTypes).flat().join(', ');

  return (
    <div className="bucket-card bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
        >
          {status === 'processing' ? (
            <span className="animate-spin">◐</span>
          ) : (
            <span>{statusInfo.icon}</span>
          )}
          {statusInfo.label}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all
          ${isDragActive && !isDragReject ? 'border-blue-400 bg-blue-50' : ''}
          ${isDragReject ? 'border-red-400 bg-red-50' : ''}
          ${!isDragActive && !isDragReject ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50' : ''}
          ${status === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className={`mb-2 ${isDragActive ? 'text-blue-500' : 'text-slate-400'}`}>
          <svg
            className="w-8 h-8 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {isDragActive && !isDragReject && (
          <p className="text-sm text-blue-600 font-medium">Drop files here...</p>
        )}
        {isDragReject && (
          <p className="text-sm text-red-600 font-medium">Invalid file type</p>
        )}
        {!isDragActive && (
          <>
            <p className="text-sm text-slate-600 font-medium">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {acceptedExtensions}
              {fileLimit && ` • Max ${fileLimit} files`}
            </p>
          </>
        )}
      </div>

      {/* Error Message */}
      {status === 'error' && errorMessage && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Footer - Show when files are uploaded */}
      {fileCount > 0 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <span className="text-sm text-slate-600">
            <span className="font-medium">{fileCount}</span> file{fileCount !== 1 ? 's' : ''} uploaded
            {fileLimit && (
              <span className="text-slate-400 ml-1">
                ({fileLimit - fileCount} remaining)
              </span>
            )}
          </span>
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-xs text-slate-500 hover:text-red-600 font-medium transition-colors"
            >
              Clear
            </button>
            {downloadUrl && status === 'ready' && (
              <a
                href={downloadUrl}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
