import api from './api';
import { isOnline } from './network';
import { enqueue } from './queue';
import * as offline from './offline';
import type {
  Product,
  ProductListItem,
  Category,
  Warehouse,
  StockMovement,
  StockSummary,
  PaginatedResponse,
} from '@/src/types/inventory';

export interface ProductFilters {
  search?: string;
  category_id?: number;
  is_active?: boolean | string;
  low_stock?: boolean;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

// Products
export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<ProductListItem>> {
  try {
    const response = await api.get<PaginatedResponse<ProductListItem>>('products', { params: filters });
    if (response.data?.data) {
      // Cast to Product[] for caching (response lacks full product fields)
      const products = response.data.data.map((p) => ({ ...p, tenant_id: 0 } as unknown as Product));
      offline.cacheProducts(products).catch(() => {});
    }
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      const cached = await offline.getCachedProducts(filters.search);
      return {
        data: cached as unknown as ProductListItem[],
        meta: { current_page: 1, last_page: 1, per_page: cached.length, total: cached.length },
      };
    }
    throw error;
  }
}

export async function getProduct(id: number): Promise<{ data: Product }> {
  try {
    const response = await api.get<{ data: Product }>(`products/${id}`);
    if (response.data?.data) {
      offline.cacheProduct(response.data.data).catch(() => {});
    }
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      const cached = await offline.getCachedProduct(id);
      if (cached) return { data: cached };
    }
    throw error;
  }
}

export async function createProduct(data: Partial<Product>): Promise<{ message: string; data: Product }> {
  const response = await api.post<{ message: string; data: Product }>('products', data);
  if (response.data?.data) {
    offline.cacheProduct(response.data.data).catch(() => {});
  }
  return response.data;
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<{ message: string; data: Product }> {
  const response = await api.put<{ message: string; data: Product }>(`products/${id}`, data);
  if (response.data?.data) {
    offline.cacheProduct(response.data.data).catch(() => {});
  }
  return response.data;
}

export async function deleteProduct(id: number): Promise<{ message: string }> {
  try {
    const response = await api.delete<{ message: string }>(`products/${id}`);
    offline.removeCachedProduct(id).catch(() => {});
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      offline.removeCachedProduct(id).catch(() => {});
      return { message: 'Queued for sync when online' };
    }
    throw error;
  }
}

export async function getProductByBarcode(barcode: string): Promise<{ data: Product }> {
  try {
    const response = await api.get<{ data: Product }>('products/barcode', { params: { barcode } });
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      const cached = await offline.getCachedProductByBarcode(barcode);
      if (cached) return { data: cached };
    }
    throw error;
  }
}

export async function getProductBySku(sku: string): Promise<{ data: Product }> {
  try {
    const response = await api.get<{ data: Product }>('products/sku', { params: { sku } });
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      const cached = await offline.getCachedProductBySku(sku);
      if (cached) return { data: cached };
    }
    throw error;
  }
}

// Categories
export async function getCategories(params: { tree?: boolean; per_page?: number } = {}): Promise<{ data: Category[]; meta?: any }> {
  try {
    const response = await api.get<{ data: Category[]; meta?: any }>('categories', { params });
    if (response.data?.data) {
      offline.cacheCategories(response.data.data).catch(() => {});
    }
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      const cached = await offline.getCachedCategories();
      return { data: cached };
    }
    throw error;
  }
}

export async function getCategory(id: number): Promise<{ data: Category }> {
  try {
    const response = await api.get<{ data: Category }>(`categories/${id}`);
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      const cached = await offline.getCachedCategory(id);
      if (cached) return { data: cached };
    }
    throw error;
  }
}

export async function createCategory(data: Partial<Category>): Promise<{ message: string; data: Category }> {
  const response = await api.post<{ message: string; data: Category }>('categories', data);
  if (response.data?.data) {
    offline.cacheCategory(response.data.data).catch(() => {});
  }
  return response.data;
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<{ message: string; data: Category }> {
  const response = await api.put<{ message: string; data: Category }>(`categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number): Promise<{ message: string }> {
  try {
    const response = await api.delete<{ message: string }>(`categories/${id}`);
    offline.removeCachedCategory(id).catch(() => {});
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      offline.removeCachedCategory(id).catch(() => {});
      return { message: 'Queued for sync when online' };
    }
    throw error;
  }
}

// Warehouses
export async function getWarehouses(params: { per_page?: number } = {}): Promise<{ data: Warehouse[]; meta?: any }> {
  try {
    const response = await api.get<{ data: Warehouse[]; meta?: any }>('warehouses', { params });
    if (response.data?.data) {
      offline.cacheWarehouses(response.data.data).catch(() => {});
    }
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      const cached = await offline.getCachedWarehouses();
      return { data: cached };
    }
    throw error;
  }
}

export async function getWarehouse(id: number): Promise<{ data: Warehouse }> {
  try {
    const response = await api.get<{ data: Warehouse }>(`warehouses/${id}`);
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      const cached = await offline.getCachedWarehouse(id);
      if (cached) return { data: cached };
    }
    throw error;
  }
}

export async function createWarehouse(data: Partial<Warehouse>): Promise<{ message: string; data: Warehouse }> {
  const response = await api.post<{ message: string; data: Warehouse }>('warehouses', data);
  if (response.data?.data) {
    offline.cacheWarehouse(response.data.data).catch(() => {});
  }
  return response.data;
}

export async function updateWarehouse(id: number, data: Partial<Warehouse>): Promise<{ message: string; data: Warehouse }> {
  const response = await api.put<{ message: string; data: Warehouse }>(`warehouses/${id}`, data);
  return response.data;
}

export async function deleteWarehouse(id: number): Promise<{ message: string }> {
  try {
    const response = await api.delete<{ message: string }>(`warehouses/${id}`);
    offline.removeCachedWarehouse(id).catch(() => {});
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      offline.removeCachedWarehouse(id).catch(() => {});
      return { message: 'Queued for sync when online' };
    }
    throw error;
  }
}

// Stock Movements
export async function getStockMovements(params: {
  product_id?: number;
  warehouse_id?: number;
  type?: string;
  per_page?: number;
  page?: number;
} = {}): Promise<PaginatedResponse<StockMovement>> {
  try {
    const response = await api.get<PaginatedResponse<StockMovement>>('stock', { params });
    if (response.data?.data) {
      offline.cacheStockMovements(response.data.data).catch(() => {});
    }
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      const cached = await offline.getCachedStockMovements(params.product_id, params.warehouse_id);
      return {
        data: cached,
        meta: { current_page: 1, last_page: 1, per_page: cached.length, total: cached.length },
      };
    }
    throw error;
  }
}

export async function createStockMovement(data: {
  product_id: number;
  warehouse_id: number;
  type: string;
  quantity: number;
  cost?: number;
  reference?: string;
  notes?: string;
  invoice_url?: string;
}): Promise<{ message: string; data: StockMovement }> {
  const response = await api.post<{ message: string; data: StockMovement }>('stock', data);
  return response.data;
}

export async function transferStock(data: {
  product_id: number;
  from_warehouse_id: number;
  to_warehouse_id: number;
  quantity: number;
  notes?: string;
}): Promise<{ message: string; data: { out: StockMovement; in: StockMovement } }> {
  const response = await api.post<{ message: string; data: { out: StockMovement; in: StockMovement } }>('stock/transfer', data);
  return response.data;
}

export async function getStockSummary(): Promise<{ data: StockSummary }> {
  try {
    const response = await api.get<{ data: StockSummary }>('stock/summary');
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      const cached = await offline.getCachedStockSummary();
      if (cached) return { data: cached };
    }
    throw error;
  }
}
