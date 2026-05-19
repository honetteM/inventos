import { getDatabase } from './database';
import type {
  Product,
  Category,
  Warehouse,
  StockMovement,
  StockSummary,
} from '@/src/types/inventory';
import type {
  InvoiceListItem,
  CustomerListItem,
  Quotation,
  Receipt,
} from '@/src/types/sales';

function toProduct(row: any): Product {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    category_id: row.category_id,
    name: row.name,
    sku: row.sku,
    barcode: row.barcode,
    description: row.description,
    cost_price: row.cost_price,
    selling_price: row.selling_price,
    unit: row.unit,
    image: row.image,
    is_active: Boolean(row.is_active),
    total_stock: row.total_stock,
    category: row.category_name ? { id: row.category_id, name: row.category_name } as any : undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toCategory(row: any): Category {
  return {
    id: row.id,
    parent_id: row.parent_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    is_active: Boolean(row.is_active),
    products_count: row.products_count,
    created_at: row.created_at,
  };
}

function toWarehouse(row: any): Warehouse {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    address: row.address,
    phone: row.phone,
    is_active: Boolean(row.is_active),
    products_count: row.products_count,
    created_at: row.created_at,
  };
}

function toStockMovement(row: any): StockMovement {
  return {
    id: row.id,
    product_id: row.product_id,
    warehouse_id: row.warehouse_id,
    user_id: row.user_id,
    type: row.type,
    quantity: row.quantity,
    before_quantity: row.before_quantity,
    after_quantity: row.after_quantity,
    cost: row.cost,
    reference: row.reference,
    notes: row.notes,
    invoice_url: row.invoice_url,
    created_at: row.created_at,
  };
}

// Products cache
export async function cacheProducts(products: Product[]): Promise<void> {
  const database = await getDatabase();
  for (const p of products) {
    await database.runAsync(
      `INSERT OR REPLACE INTO cached_products
       (id, tenant_id, category_id, category_name, name, sku, barcode, description,
        cost_price, selling_price, unit, image, is_active, total_stock, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id, p.tenant_id, p.category_id, p.category?.name || null,
        p.name, p.sku, p.barcode, p.description,
        p.cost_price, p.selling_price, p.unit, p.image,
        p.is_active ? 1 : 0, p.total_stock, p.created_at, p.updated_at,
      ]
    );
  }
  await database.runAsync(
    `INSERT OR REPLACE INTO cache_meta (key, value, updated_at) VALUES (?, ?, ?)`,
    ['products_cached_at', new Date().toISOString(), new Date().toISOString()]
  );
}

export async function getCachedProducts(search?: string): Promise<Product[]> {
  const database = await getDatabase();
  let query = 'SELECT * FROM cached_products WHERE 1=1';
  const params: any[] = [];
  if (search) {
    query += ' AND (name LIKE ? OR sku LIKE ? OR barcode LIKE ?)';
    const pattern = `%${search}%`;
    params.push(pattern, pattern, pattern);
  }
  query += ' ORDER BY name ASC';
  const rows = await database.getAllAsync(query, params);
  return rows.map(toProduct);
}

export async function getCachedProduct(id: number): Promise<Product | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync('SELECT * FROM cached_products WHERE id = ?', [id]);
  return row ? toProduct(row) : null;
}

export async function getCachedProductByBarcode(barcode: string): Promise<Product | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync('SELECT * FROM cached_products WHERE barcode = ?', [barcode]);
  return row ? toProduct(row) : null;
}

export async function getCachedProductBySku(sku: string): Promise<Product | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync('SELECT * FROM cached_products WHERE sku = ?', [sku]);
  return row ? toProduct(row) : null;
}

export async function cacheProduct(product: Product): Promise<void> {
  await cacheProducts([product]);
}

export async function removeCachedProduct(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM cached_products WHERE id = ?', [id]);
}

// Categories cache
export async function cacheCategories(categories: Category[]): Promise<void> {
  const database = await getDatabase();
  for (const c of categories) {
    await database.runAsync(
      `INSERT OR REPLACE INTO cached_categories
       (id, parent_id, name, slug, description, is_active, products_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.parent_id, c.name, c.slug, c.description, c.is_active ? 1 : 0, c.products_count || 0, c.created_at]
    );
  }
  await database.runAsync(
    `INSERT OR REPLACE INTO cache_meta (key, value, updated_at) VALUES (?, ?, ?)`,
    ['categories_cached_at', new Date().toISOString(), new Date().toISOString()]
  );
}

export async function getCachedCategories(): Promise<Category[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync('SELECT * FROM cached_categories ORDER BY name ASC');
  return rows.map(toCategory);
}

export async function getCachedCategory(id: number): Promise<Category | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync('SELECT * FROM cached_categories WHERE id = ?', [id]);
  return row ? toCategory(row) : null;
}

export async function cacheCategory(category: Category): Promise<void> {
  await cacheCategories([category]);
}

export async function removeCachedCategory(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM cached_categories WHERE id = ?', [id]);
}

// Warehouses cache
export async function cacheWarehouses(warehouses: Warehouse[]): Promise<void> {
  const database = await getDatabase();
  for (const w of warehouses) {
    await database.runAsync(
      `INSERT OR REPLACE INTO cached_warehouses
       (id, name, code, description, address, phone, is_active, products_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [w.id, w.name, w.code, w.description, w.address, w.phone, w.is_active ? 1 : 0, w.products_count || 0, w.created_at]
    );
  }
  await database.runAsync(
    `INSERT OR REPLACE INTO cache_meta (key, value, updated_at) VALUES (?, ?, ?)`,
    ['warehouses_cached_at', new Date().toISOString(), new Date().toISOString()]
  );
}

export async function getCachedWarehouses(): Promise<Warehouse[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync('SELECT * FROM cached_warehouses ORDER BY name ASC');
  return rows.map(toWarehouse);
}

export async function getCachedWarehouse(id: number): Promise<Warehouse | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync('SELECT * FROM cached_warehouses WHERE id = ?', [id]);
  return row ? toWarehouse(row) : null;
}

export async function cacheWarehouse(warehouse: Warehouse): Promise<void> {
  await cacheWarehouses([warehouse]);
}

export async function removeCachedWarehouse(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM cached_warehouses WHERE id = ?', [id]);
}

// Stock Movements cache
export async function cacheStockMovements(movements: StockMovement[]): Promise<void> {
  const database = await getDatabase();
  for (const m of movements) {
    await database.runAsync(
      `INSERT OR REPLACE INTO cached_stock_movements
       (id, product_id, warehouse_id, user_id, type, quantity, before_quantity, after_quantity,
        cost, reference, notes, invoice_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [m.id, m.product_id, m.warehouse_id, m.user_id, m.type, m.quantity,
       m.before_quantity, m.after_quantity, m.cost, m.reference, m.notes, m.invoice_url, m.created_at]
    );
  }
}

export async function getCachedStockMovements(productId?: number, warehouseId?: number): Promise<StockMovement[]> {
  const database = await getDatabase();
  let query = 'SELECT * FROM cached_stock_movements WHERE 1=1';
  const params: any[] = [];
  if (productId) {
    query += ' AND product_id = ?';
    params.push(productId);
  }
  if (warehouseId) {
    query += ' AND warehouse_id = ?';
    params.push(warehouseId);
  }
  query += ' ORDER BY created_at DESC';
  const rows = await database.getAllAsync(query, params);
  return rows.map(toStockMovement);
}

export async function getCachedStockSummary(): Promise<StockSummary | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<Record<string, number>>(`
    SELECT
      COUNT(*) as total_products,
      SUM(CASE WHEN total_stock = 0 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN total_stock < 10 AND total_stock > 0 THEN 1 ELSE 0 END) as low_stock,
      SUM(total_stock * cost_price) as total_stock_value
    FROM cached_products
  `);
  if (!row) return null;
  return {
    total_products: row.total_products || 0,
    out_of_stock: row.out_of_stock || 0,
    low_stock: row.low_stock || 0,
    total_stock_value: row.total_stock_value || 0,
  };
}

// Metadata helpers
export async function getCacheTimestamp(key: string): Promise<string | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<Record<string, string>>(
    'SELECT value FROM cache_meta WHERE key = ?', [key]
  );
  return row?.value || null;
}

export async function isCacheStale(key: string, maxAgeMs: number = 5 * 60 * 1000): Promise<boolean> {
  const ts = await getCacheTimestamp(key);
  if (!ts) return true;
  const age = Date.now() - new Date(ts).getTime();
  return age > maxAgeMs;
}

// Bulk cache refresh
export async function clearAllCache(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM cached_products;
    DELETE FROM cached_categories;
    DELETE FROM cached_warehouses;
    DELETE FROM cached_stock_movements;
    DELETE FROM cache_meta WHERE key IN ('products_cached_at', 'categories_cached_at', 'warehouses_cached_at');
  `);
}

// Invoices cache
export async function cacheInvoices(invoices: InvoiceListItem[]): Promise<void> {
  const database = await getDatabase();
  for (const inv of invoices) {
    await database.runAsync(
      `INSERT OR REPLACE INTO cached_invoices
       (id, invoice_number, customer_name, status, issue_date, total, balance_due, paid_amount, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [inv.id, inv.invoice_number, inv.customer_name, inv.status, inv.issue_date, inv.total, inv.balance_due, inv.paid_amount, inv.created_at]
    );
  }
}

export async function getCachedInvoices(): Promise<InvoiceListItem[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync('SELECT * FROM cached_invoices ORDER BY created_at DESC');
  return rows as InvoiceListItem[];
}

export async function getCachedInvoice(id: number): Promise<InvoiceListItem | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<InvoiceListItem>('SELECT * FROM cached_invoices WHERE id = ?', [id]);
  return row || null;
}

export async function cacheInvoice(invoice: InvoiceListItem): Promise<void> {
  await cacheInvoices([invoice]);
}

export async function removeCachedInvoice(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM cached_invoices WHERE id = ?', [id]);
}

// Customers cache
export async function cacheCustomers(customers: CustomerListItem[]): Promise<void> {
  const database = await getDatabase();
  for (const c of customers) {
    await database.runAsync(
      `INSERT OR REPLACE INTO cached_customers
       (id, name, email, phone, total_purchases, balance, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.name, c.email, c.phone, c.total_purchases, c.balance, c.is_active ? 1 : 0, c.created_at]
    );
  }
}

export async function getCachedCustomers(): Promise<CustomerListItem[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync('SELECT * FROM cached_customers ORDER BY name ASC');
  return rows as CustomerListItem[];
}

export async function getCachedCustomer(id: number): Promise<CustomerListItem | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<CustomerListItem>('SELECT * FROM cached_customers WHERE id = ?', [id]);
  return row || null;
}

export async function cacheCustomer(customer: CustomerListItem): Promise<void> {
  await cacheCustomers([customer]);
}

export async function removeCachedCustomer(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM cached_customers WHERE id = ?', [id]);
}

// Quotations cache
export async function cacheQuotations(quotations: Quotation[]): Promise<void> {
  const database = await getDatabase();
  for (const q of quotations) {
    await database.runAsync(
      `INSERT OR REPLACE INTO cached_quotations
       (id, quotation_number, customer_name, status, total, currency, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [q.id, q.quotation_number, q.customer?.name || null, q.status, q.total, q.currency, q.created_at]
    );
  }
}

export async function getCachedQuotations(): Promise<Quotation[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync('SELECT * FROM cached_quotations ORDER BY created_at DESC');
  return rows as unknown as Quotation[];
}

// Receipts cache
export async function cacheReceipts(receipts: Receipt[]): Promise<void> {
  const database = await getDatabase();
  for (const r of receipts) {
    await database.runAsync(
      `INSERT OR REPLACE INTO cached_receipts
       (id, receipt_number, amount, payment_method, receipt_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [r.id, r.receipt_number, r.amount, r.payment_method, r.receipt_date, r.created_at]
    );
  }
}

export async function getCachedReceipts(): Promise<Receipt[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync('SELECT * FROM cached_receipts ORDER BY created_at DESC');
  return rows as unknown as Receipt[];
}
