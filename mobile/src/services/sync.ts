import { getDatabase } from './database';
import api from './api';
import { isOnline, subscribeToNetwork } from './network';
import { clearAllCache } from './offline';
import { enqueue, SyncQueueItem } from './queue';
import NetInfo from '@react-native-community/netinfo';

type SyncEventListener = (event: SyncEvent) => void;

export interface SyncEvent {
  type: 'sync_start' | 'sync_complete' | 'sync_error' | 'item_completed' | 'item_failed' | 'conflict';
  item?: SyncQueueItem;
  error?: string;
  pendingCount?: number;
}

const syncListeners: Set<SyncEventListener> = new Set();

export function onSyncEvent(callback: SyncEventListener): () => void {
  syncListeners.add(callback);
  return () => syncListeners.delete(callback);
}

function emitEvent(event: SyncEvent) {
  for (const listener of syncListeners) {
    listener(event);
  }
}

// Process the sync queue
let isProcessing = false;

export async function processQueue(): Promise<void> {
  if (isProcessing) return;
  if (!isOnline()) return;

  isProcessing = true;
  emitEvent({ type: 'sync_start' });

  try {
    const database = await getDatabase();
    let hasMore = true;

    while (hasMore) {
      const items = await database.getAllAsync<SyncQueueItem>(
        `SELECT * FROM sync_queue
         WHERE status = 'pending'
           AND (next_retry_at IS NULL OR next_retry_at <= ?)
         ORDER BY priority DESC, created_at ASC
         LIMIT 5`,
        [new Date().toISOString()]
      );

      if (items.length === 0) {
        hasMore = false;
        break;
      }

      for (const item of items) {
        await processItem(item);
      }
    }

    emitEvent({ type: 'sync_complete' });
  } catch (error: any) {
    emitEvent({ type: 'sync_error', error: error.message });
  } finally {
    isProcessing = false;
  }
}

async function processItem(item: SyncQueueItem): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `UPDATE sync_queue SET status = 'processing', updated_at = ? WHERE id = ?`,
    [new Date().toISOString(), item.id]
  );

  try {
    const config: any = {
      method: item.method.toLowerCase(),
      url: item.endpoint,
    };

    if (item.body) {
      config.data = JSON.parse(item.body);
    }

    const response = await api.request(config);

    if (response.status >= 200 && response.status < 300) {
      await database.runAsync(
        `UPDATE sync_queue SET status = 'completed', attempts = attempts + 1, updated_at = ? WHERE id = ?`,
        [new Date().toISOString(), item.id]
      );
      emitEvent({ type: 'item_completed', item, pendingCount: await getPendingCount() });
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error: any) {
    const isConflict = error.response?.status === 409;
    const isServerError = error.response?.status && error.response.status >= 500;
    const isNetworkError = !error.response;

    const newAttempts = item.attempts + 1;

    if (isConflict) {
      await database.runAsync(
        `UPDATE sync_queue SET status = 'conflict', attempts = ?, last_error = ?, updated_at = ? WHERE id = ?`,
        [newAttempts, error.message, new Date().toISOString(), item.id]
      );
      emitEvent({ type: 'conflict', item, error: error.message });
    } else if (newAttempts >= item.max_attempts || (isServerError && newAttempts >= 3)) {
      await database.runAsync(
        `UPDATE sync_queue SET status = 'failed', attempts = ?, last_error = ?, updated_at = ? WHERE id = ?`,
        [newAttempts, error.message, new Date().toISOString(), item.id]
      );
      emitEvent({ type: 'item_failed', item, error: error.message });
    } else {
      const backoffDelay = Math.min(Math.pow(2, newAttempts) * 1000, 30000);
      const nextRetry = new Date(Date.now() + backoffDelay).toISOString();
      await database.runAsync(
        `UPDATE sync_queue SET status = 'pending', attempts = ?, last_error = ?, next_retry_at = ?, updated_at = ? WHERE id = ?`,
        [newAttempts, error.message, nextRetry, new Date().toISOString(), item.id]
      );
    }
  }
}

export async function getPendingCount(): Promise<number> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM sync_queue WHERE status IN ('pending', 'processing')"
  );
  return row?.count || 0;
}

export async function getFailedItems(): Promise<SyncQueueItem[]> {
  const database = await getDatabase();
  return database.getAllAsync<SyncQueueItem>(
    "SELECT * FROM sync_queue WHERE status IN ('failed', 'conflict') ORDER BY created_at DESC"
  );
}

export async function retryItem(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE sync_queue SET status = 'pending', next_retry_at = ?, updated_at = ? WHERE id = ?`,
    [new Date().toISOString(), new Date().toISOString(), id]
  );
  processQueue();
}

export async function retryAllFailed(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE sync_queue SET status = 'pending', next_retry_at = ?, updated_at = ?
     WHERE status IN ('failed', 'conflict') AND attempts < max_attempts`,
    [new Date().toISOString(), new Date().toISOString()]
  );
  processQueue();
}

export async function clearCompleted(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM sync_queue WHERE status = 'completed'");
}

async function refreshCacheFromApi(): Promise<void> {
  if (!isOnline()) return;
  try {
    const [productsRes, categoriesRes, warehousesRes] = await Promise.all([
      api.get('products?per_page=1000'),
      api.get('categories?per_page=1000'),
      api.get('warehouses?per_page=1000'),
    ]);

    const { cacheProducts } = await import('./offline');
    const { cacheCategories } = await import('./offline');
    const { cacheWarehouses } = await import('./offline');

    if (productsRes.data?.data) {
      await cacheProducts(productsRes.data.data);
    }
    if (categoriesRes.data?.data) {
      await cacheCategories(categoriesRes.data.data);
    }
    if (warehousesRes.data?.data) {
      await cacheWarehouses(warehousesRes.data.data);
    }
  } catch {
  }
}

export async function fullSync(): Promise<void> {
  if (!isOnline()) return;
  emitEvent({ type: 'sync_start' });
  await processQueue();
  await refreshCacheFromApi();
  await clearCompleted();
  emitEvent({ type: 'sync_complete' });
}

let syncInitialized = false;

export function initializeSync(): () => void {
  if (syncInitialized) return () => {};
  syncInitialized = true;

  const unsubscribe = subscribeToNetwork(async (state) => {
    if (state.isConnected) {
      await processQueue();
      await refreshCacheFromApi();
    }
  });

  // Periodic sync every 5 minutes
  const interval = setInterval(async () => {
    if (isOnline()) {
      await processQueue();
    }
  }, 5 * 60 * 1000);

  return () => {
    unsubscribe();
    clearInterval(interval);
    syncInitialized = false;
  };
}
