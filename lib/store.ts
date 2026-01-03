import { create } from 'zustand';
import { BucketType, BucketStatus } from '@/types';

// ============================================
// KNOWLEDGE STORE
// ============================================
// Manages state for all 4 knowledge buckets:
// - Website (RAG)
// - Documentation (RAG)
// - Transcripts (Extraction → Playbook)
// - Tickets (Extraction → FAQ Guide)
// ============================================

export interface BucketState {
  files: File[];
  status: BucketStatus;
  fileCount: number;
  playbookUrl?: string;
  errorMessage?: string;
  lastUpdated?: Date;
}

interface KnowledgeState {
  // Bucket states
  buckets: Record<BucketType, BucketState>;
  
  // Actions
  uploadFiles: (bucketType: BucketType, files: File[]) => void;
  setStatus: (bucketType: BucketType, status: BucketStatus, errorMessage?: string) => void;
  setPlaybookUrl: (bucketType: BucketType, url: string) => void;
  clearBucket: (bucketType: BucketType) => void;
  clearAllBuckets: () => void;
}

// Initial state for each bucket
const initialBucketState: BucketState = {
  files: [],
  status: 'empty',
  fileCount: 0,
  playbookUrl: undefined,
  errorMessage: undefined,
  lastUpdated: undefined,
};

// Create the store
export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  buckets: {
    website: { ...initialBucketState },
    documentation: { ...initialBucketState },
    transcripts: { ...initialBucketState },
    tickets: { ...initialBucketState },
  },

  uploadFiles: (bucketType, files) => {
    set((state) => ({
      buckets: {
        ...state.buckets,
        [bucketType]: {
          ...state.buckets[bucketType],
          files: [...state.buckets[bucketType].files, ...files],
          fileCount: state.buckets[bucketType].fileCount + files.length,
          status: 'processing',
          lastUpdated: new Date(),
        },
      },
    }));
  },

  setStatus: (bucketType, status, errorMessage) => {
    set((state) => ({
      buckets: {
        ...state.buckets,
        [bucketType]: {
          ...state.buckets[bucketType],
          status,
          errorMessage: errorMessage || undefined,
        },
      },
    }));
  },

  setPlaybookUrl: (bucketType, url) => {
    set((state) => ({
      buckets: {
        ...state.buckets,
        [bucketType]: {
          ...state.buckets[bucketType],
          playbookUrl: url,
          status: 'ready',
        },
      },
    }));
  },

  clearBucket: (bucketType) => {
    set((state) => ({
      buckets: {
        ...state.buckets,
        [bucketType]: { ...initialBucketState },
      },
    }));
  },

  clearAllBuckets: () => {
    set({
      buckets: {
        website: { ...initialBucketState },
        documentation: { ...initialBucketState },
        transcripts: { ...initialBucketState },
        tickets: { ...initialBucketState },
      },
    });
  },
}));

// ============================================
// BUCKET CONFIGURATION
// ============================================
// Static configuration for each bucket type
// ============================================

export interface BucketConfig {
  type: BucketType;
  title: string;
  description: string;
  acceptedExtensions: string[];
  acceptedMimeTypes: Record<string, string[]>;
  fileLimit?: number;
  processingType: 'rag' | 'extraction';
}

export const bucketConfigs: BucketConfig[] = [
  {
    type: 'website',
    title: 'Website',
    description: 'Upload website pages or provide URLs',
    acceptedExtensions: ['.html', '.txt', '.md'],
    acceptedMimeTypes: {
      'text/html': ['.html', '.htm'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    processingType: 'rag',
  },
  {
    type: 'documentation',
    title: 'Documentation',
    description: 'Upload product docs and help content',
    acceptedExtensions: ['.html', '.txt', '.md', '.pdf'],
    acceptedMimeTypes: {
      'text/html': ['.html', '.htm'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/pdf': ['.pdf'],
    },
    processingType: 'rag',
  },
  {
    type: 'transcripts',
    title: 'Transcripts',
    description: 'Upload sales call transcripts',
    acceptedExtensions: ['.txt'],
    acceptedMimeTypes: {
      'text/plain': ['.txt'],
    },
    fileLimit: 30,
    processingType: 'extraction',
  },
  {
    type: 'tickets',
    title: 'Support Tickets',
    description: 'Upload customer support tickets',
    acceptedExtensions: ['.txt', '.csv'],
    acceptedMimeTypes: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    fileLimit: 1000,
    processingType: 'extraction',
  },
];

// Helper to get config by type
export const getBucketConfig = (type: BucketType): BucketConfig => {
  const config = bucketConfigs.find((c) => c.type === type);
  if (!config) throw new Error(`Unknown bucket type: ${type}`);
  return config;
};


