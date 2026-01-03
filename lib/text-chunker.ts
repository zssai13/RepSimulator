// ============================================
// TEXT CHUNKER
// ============================================
// Splits documents into overlapping chunks for embedding.
// Preserves paragraph boundaries where possible.
// ============================================

export interface TextChunk {
  text: string;
  metadata: {
    source: string;
    chunkIndex: number;
    totalChunks?: number;
  };
}

export interface ChunkOptions {
  chunkSize?: number;      // Target size in characters (default: 1500 ≈ 375 tokens)
  chunkOverlap?: number;   // Overlap in characters (default: 200 ≈ 50 tokens)
  minChunkSize?: number;   // Minimum chunk size (default: 100)
}

const DEFAULT_OPTIONS: Required<ChunkOptions> = {
  chunkSize: 1500,
  chunkOverlap: 200,
  minChunkSize: 100,
};

/**
 * Splits text into overlapping chunks while trying to preserve paragraph boundaries
 */
export function chunkText(
  text: string,
  source: string,
  options: ChunkOptions = {}
): TextChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const chunks: TextChunk[] = [];

  // Clean the text
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  if (cleanedText.length === 0) {
    return [];
  }

  // If text is small enough, return as single chunk
  if (cleanedText.length <= opts.chunkSize) {
    return [{
      text: cleanedText,
      metadata: { source, chunkIndex: 0, totalChunks: 1 },
    }];
  }

  // Split into paragraphs first
  const paragraphs = cleanedText.split(/\n\n+/);
  
  let currentChunk = '';
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) continue;

    // If adding this paragraph would exceed chunk size
    if (currentChunk.length + trimmedParagraph.length + 2 > opts.chunkSize) {
      // Save current chunk if it meets minimum size
      if (currentChunk.length >= opts.minChunkSize) {
        chunks.push({
          text: currentChunk.trim(),
          metadata: { source, chunkIndex },
        });
        chunkIndex++;

        // Start new chunk with overlap from end of current chunk
        const overlapStart = Math.max(0, currentChunk.length - opts.chunkOverlap);
        currentChunk = currentChunk.substring(overlapStart).trim();
      }

      // If paragraph itself is too large, split it by sentences
      if (trimmedParagraph.length > opts.chunkSize) {
        const sentenceChunks = chunkBySentences(
          trimmedParagraph,
          source,
          chunkIndex,
          opts
        );
        
        for (const sentenceChunk of sentenceChunks) {
          chunks.push(sentenceChunk);
          chunkIndex++;
        }
        currentChunk = '';
        continue;
      }
    }

    // Add paragraph to current chunk
    currentChunk += (currentChunk ? '\n\n' : '') + trimmedParagraph;
  }

  // Don't forget the last chunk
  if (currentChunk.length >= opts.minChunkSize) {
    chunks.push({
      text: currentChunk.trim(),
      metadata: { source, chunkIndex },
    });
  }

  // Update total chunks count
  const totalChunks = chunks.length;
  chunks.forEach((chunk) => {
    chunk.metadata.totalChunks = totalChunks;
  });

  return chunks;
}

/**
 * Splits text by sentences when paragraphs are too large
 */
function chunkBySentences(
  text: string,
  source: string,
  startIndex: number,
  opts: Required<ChunkOptions>
): TextChunk[] {
  const chunks: TextChunk[] = [];
  
  // Split by sentence endings (., !, ?)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = '';
  let chunkIndex = startIndex;

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();

    if (currentChunk.length + trimmedSentence.length + 1 > opts.chunkSize) {
      if (currentChunk.length >= opts.minChunkSize) {
        chunks.push({
          text: currentChunk.trim(),
          metadata: { source, chunkIndex },
        });
        chunkIndex++;

        // Overlap
        const overlapStart = Math.max(0, currentChunk.length - opts.chunkOverlap);
        currentChunk = currentChunk.substring(overlapStart).trim();
      }
    }

    currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
  }

  if (currentChunk.length >= opts.minChunkSize) {
    chunks.push({
      text: currentChunk.trim(),
      metadata: { source, chunkIndex },
    });
  }

  return chunks;
}

/**
 * Chunks multiple documents
 */
export function chunkDocuments(
  documents: Array<{ content: string; filename: string }>,
  options?: ChunkOptions
): TextChunk[] {
  const allChunks: TextChunk[] = [];

  for (const doc of documents) {
    const chunks = chunkText(doc.content, doc.filename, options);
    allChunks.push(...chunks);
  }

  return allChunks;
}


