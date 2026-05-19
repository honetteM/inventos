export interface Customer {
  id: number;
  tenant_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_id: string | null;
  credit_limit: number;
  total_purchases: number;
  balance: number;
  notes: string | null;
  is_active: boolean;
  invoices_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerListItem {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  total_purchases: number;
  balance: number;
  is_active: boolean;
  created_at: string;
}

export interface InvoiceItem {
  id?: number;
  product_id?: number | null;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
}

export interface Invoice {
  id: number;
  tenant_id: number;
  customer_id: number | null;
  customer?: Customer | null;
  invoice_number: string;
  status: 'draft' | 'confirmed' | 'partial' | 'paid' | 'cancelled';
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid_amount: number;
  balance_due: number;
  payment_method: string | null;
  payment_status: 'unpaid' | 'partial' | 'paid';
  notes: string | null;
  currency: string;
  items?: InvoiceItem[];
  receipts?: Receipt[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceListItem {
  id: number;
  invoice_number: string;
  customer_name: string | null;
  status: string;
  issue_date: string;
  total: number;
  balance_due: number;
  paid_amount: number;
  payment_method: string | null;
  payment_status: string | null;
  created_at: string;
}

export interface Quotation {
  id: number;
  tenant_id: number;
  customer_id: number | null;
  customer?: Customer | null;
  quotation_number: string;
  status: string;
  issue_date: string;
  valid_until: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes: string | null;
  terms: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Receipt {
  id: number;
  tenant_id: number;
  invoice_id: number | null;
  customer_id: number | null;
  customer?: Customer | null;
  receipt_number: string;
  amount: number;
  payment_method: 'cash' | 'mobile_money' | 'bank' | 'card' | 'cheque';
  reference: string | null;
  receipt_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
