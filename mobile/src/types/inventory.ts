export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  products_count?: number;
  children?: Category[];
  created_at: string;
}

export interface Warehouse {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  products_count?: number;
  pivot?: {
    quantity: number;
    cost: number;
  };
  created_at: string;
}

export interface Product {
  id: number;
  tenant_id: number;
  category_id: number | null;
  category?: Category | null;
  name: string;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  cost_price: number;
  selling_price: number;
  unit: string | null;
  image: string | null;
  is_active: boolean;
  total_stock: number;
  warehouses?: Warehouse[];
  stock_movements?: StockMovement[];
  created_at: string;
  updated_at: string;
}

export interface ProductListItem {
  id: number;
  name: string;
  sku: string | null;
  barcode: string | null;
  selling_price: number;
  cost_price: number;
  unit: string | null;
  is_active: boolean;
  total_stock: number;
  category_name?: string;
  created_at: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  product?: ProductListItem;
  warehouse_id: number;
  warehouse?: Warehouse;
  user_id: number | null;
  type: 'stock_in' | 'stock_out' | 'transfer_in' | 'transfer_out' | 'adjustment_plus' | 'adjustment_minus' | 'return';
  quantity: number;
  before_quantity: number;
  after_quantity: number;
  cost: number;
  reference: string | null;
  notes: string | null;
  invoice_url: string | null;
  created_at: string;
}

export interface StockSummary {
  total_products: number;
  low_stock: number;
  out_of_stock: number;
  total_stock_value: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
