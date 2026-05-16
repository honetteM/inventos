import { getDatabase } from './database';

export interface SyncQueueItem {
  id: number;
  uuid: string;
  endpoint: string;
  method: string;
  body: string | null;
  headers: string | null;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'conflict';
  attempts: number;
  max_attempts: number;
  last_error: string | null;
  next_retry_at: string | null;
  created_at: string;
  updated_at: string | null;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function enqueue(
  endpoint: string,
  method: string,
  body?: Record<string, any>,
  priority: number = 0
): Promise<void> {
  const database = await getDatabase();
  const uuid = generateUUID();
  const now = new Date().toISOString();

  await database.runAsync(
    `INSERT INTO sync_queue (uuid, endpoint, method, body, priority, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
    [uuid, endpoint, method, body ? JSON.stringify(body) : null, priority, now]
  );
}
