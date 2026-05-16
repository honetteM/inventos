import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('inventory_offline.db');
  await runMigrations(db);
  return db;
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS cached_products (
      id INTEGER PRIMARY KEY,
      tenant_id INTEGER NOT NULL,
      category_id INTEGER,
      category_name TEXT,
      name TEXT NOT NULL,
      sku TEXT,
      barcode TEXT,
      description TEXT,
      cost_price REAL DEFAULT 0,
      selling_price REAL DEFAULT 0,
      unit TEXT,
      image TEXT,
      is_active INTEGER DEFAULT 1,
      total_stock REAL DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS cached_categories (
      id INTEGER PRIMARY KEY,
      parent_id INTEGER,
      name TEXT NOT NULL,
      slug TEXT,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      products_count INTEGER DEFAULT 0,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS cached_warehouses (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT,
      description TEXT,
      address TEXT,
      phone TEXT,
      is_active INTEGER DEFAULT 1,
      products_count INTEGER DEFAULT 0,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS cached_stock_movements (
      id INTEGER PRIMARY KEY,
      product_id INTEGER NOT NULL,
      product_name TEXT,
      warehouse_id INTEGER NOT NULL,
      warehouse_name TEXT,
      user_id INTEGER,
      type TEXT NOT NULL,
      quantity REAL NOT NULL,
      before_quantity REAL DEFAULT 0,
      after_quantity REAL DEFAULT 0,
      cost REAL DEFAULT 0,
      reference TEXT,
      notes TEXT,
      invoice_url TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      body TEXT,
      headers TEXT,
      priority INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      max_attempts INTEGER DEFAULT 5,
      last_error TEXT,
      next_retry_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS cache_meta (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT
    );
  `);
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
