// ============================================
// VECTOR STORE
// ============================================
// LanceDB operations for RAG:
// - Storing embedded document chunks
// - Semantic search for relevant context
// ============================================

import * as lancedb from '@lancedb/lancedb';
import OpenAI from 'openai';
import { TextChunk } from './text-chunker';
import path from 'path';

// Initialize OpenAI client for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Database path
const DB_PATH = path.join(process.cwd(), 'data', 'lancedb');

// Table names for each bucket
export type TableName = 'website' | 'documentation';

// Schema for stored documents
interface DocumentRecord {
  id: string;
  text: string;
  source: string;
  chunkIndex: number;
  vector: number[];
}

// Connection cache
let dbConnection: lancedb.Connection | null = null;

/**
 * Get or create database connection
 */
async function getConnection(): Promise<lancedb.Connection> {
  if (!dbConnection) {
    dbConnection = await lancedb.connect(DB_PATH);
  }
  return dbConnection;
}

/**
 * Generate embeddings for text using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts (batched)
 */
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // OpenAI allows batching up to 2048 inputs
  const batchSize = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
    });
    allEmbeddings.push(...response.data.map((d) => d.embedding));
  }

  return allEmbeddings;
}

/**
 * Ingest documents into a table
 * Clears existing data and adds new documents
 */
export async function ingestDocuments(
  tableName: TableName,
  chunks: TextChunk[]
): Promise<{ success: boolean; chunksProcessed: number; error?: string }> {
  try {
    if (chunks.length === 0) {
      return { success: true, chunksProcessed: 0 };
    }

    const db = await getConnection();

    // Generate embeddings for all chunks
    console.log(`Generating embeddings for ${chunks.length} chunks...`);
    const texts = chunks.map((c) => c.text);
    const embeddings = await generateEmbeddings(texts);

    // Create records
    const records: DocumentRecord[] = chunks.map((chunk, index) => ({
      id: `${chunk.metadata.source}-${chunk.metadata.chunkIndex}`,
      text: chunk.text,
      source: chunk.metadata.source,
      chunkIndex: chunk.metadata.chunkIndex,
      vector: embeddings[index],
    }));

    // Check if table exists
    const tables = await db.tableNames();
    
    if (tables.includes(tableName)) {
      // Drop existing table to replace content
      await db.dropTable(tableName);
    }

    // Create new table with data
    await db.createTable(tableName, records);

    console.log(`Ingested ${records.length} chunks into ${tableName}`);
    return { success: true, chunksProcessed: records.length };

  } catch (error) {
    console.error('Ingest error:', error);
    return {
      success: false,
      chunksProcessed: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Query a table for relevant chunks
 */
export async function queryTable(
  tableName: TableName,
  query: string,
  topK: number = 5
): Promise<Array<{ text: string; source: string; score: number }>> {
  try {
    const db = await getConnection();

    // Check if table exists
    const tables = await db.tableNames();
    if (!tables.includes(tableName)) {
      return [];
    }

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);

    // Open table and search
    const table = await db.openTable(tableName);
    const results = await table
      .vectorSearch(queryEmbedding)
      .limit(topK)
      .toArray();

    return results.map((row) => ({
      text: row.text as string,
      source: row.source as string,
      score: row._distance as number,
    }));

  } catch (error) {
    console.error('Query error:', error);
    return [];
  }
}

/**
 * Query multiple tables and combine results
 */
export async function queryAllTables(
  query: string,
  topK: number = 5
): Promise<Array<{ text: string; source: string; table: TableName; score: number }>> {
  const tables: TableName[] = ['website', 'documentation'];
  const allResults: Array<{ text: string; source: string; table: TableName; score: number }> = [];

  for (const tableName of tables) {
    const results = await queryTable(tableName, query, topK);
    allResults.push(
      ...results.map((r) => ({ ...r, table: tableName }))
    );
  }

  // Sort by score (lower is better for distance)
  allResults.sort((a, b) => a.score - b.score);

  // Return top K overall
  return allResults.slice(0, topK);
}

/**
 * Clear a specific table
 */
export async function clearTable(tableName: TableName): Promise<void> {
  try {
    const db = await getConnection();
    const tables = await db.tableNames();
    
    if (tables.includes(tableName)) {
      await db.dropTable(tableName);
      console.log(`Cleared table: ${tableName}`);
    }
  } catch (error) {
    console.error('Clear table error:', error);
  }
}

/**
 * Check if a table has content
 */
export async function hasContent(tableName: TableName): Promise<boolean> {
  try {
    const db = await getConnection();
    const tables = await db.tableNames();
    return tables.includes(tableName);
  } catch {
    return false;
  }
}

/**
 * Get count of documents in a table
 */
export async function getDocumentCount(tableName: TableName): Promise<number> {
  try {
    const db = await getConnection();
    const tables = await db.tableNames();
    
    if (!tables.includes(tableName)) {
      return 0;
    }

    const table = await db.openTable(tableName);
    return await table.countRows();
  } catch {
    return 0;
  }
}


