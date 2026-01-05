// Message types for conversation
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'initial';
  content: string;
  timestamp: Date;
}

// Conversation state
export interface Conversation {
  messages: Message[];
  initialMessage: string;
  pageContext: string;
  goal: string;
  isActive: boolean;
}

// Knowledge bucket types
export type BucketType = 'website' | 'documentation' | 'transcripts' | 'tickets';

export type BucketStatus = 'empty' | 'processing' | 'ready' | 'error';

export interface KnowledgeBucket {
  type: BucketType;
  title: string;
  description: string;
  acceptedFiles: string[];
  fileLimit?: number;
  files: File[];
  status: BucketStatus;
  playbookUrl?: string;
  errorMessage?: string;
}

// Simulation configuration
export interface SimulationConfig {
  initialMessage: string;
  pageContext: string;
  goal: string;
}

// API response types
export interface ChatResponse {
  message: string;
  error?: string;
}

export interface ExtractResponse {
  success: boolean;
  playbookUrl?: string;
  error?: string;
}

export interface IngestResponse {
  success: boolean;
  chunksProcessed?: number;
  error?: string;
}

