import api from './api';
import * as offline from './offline';
import { isOnline } from './network';
import { enqueue } from './queue';
import { File, Paths } from 'expo-file-system';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import type {
  Customer,
  CustomerListItem,
  Invoice,
  InvoiceListItem,
  Quotation,
  Receipt,
} from '@/src/types/sales';
import type { PaginatedResponse } from '@/src/types/inventory';

// Customers
export async function getCustomers(params: {
  search?: string;
  is_active?: boolean;
  per_page?: number;
  page?: number;
} = {}): Promise<PaginatedResponse<CustomerListItem>> {
  try {
    const response = await api.get<PaginatedResponse<CustomerListItem>>('customers', { params });
    if (response.data?.data) {
      offline.cacheCustomers(response.data.data).catch(() => {});
    }
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      const cached = await offline.getCachedCustomers();
      return {
        data: cached,
        meta: { current_page: 1, last_page: 1, per_page: cached.length, total: cached.length },
      };
    }
    throw error;
  }
}

export async function getCustomer(id: number): Promise<{ data: Customer }> {
  try {
    const response = await api.get<{ data: Customer }>(`customers/${id}`);
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      const cached = await offline.getCachedCustomer(id);
      if (cached) return { data: cached as unknown as Customer };
    }
    throw error;
  }
}

export async function createCustomer(data: Partial<Customer>): Promise<{ message: string; data: Customer }> {
  if (!(await isOnline())) {
    return { message: 'Queued for sync when online', data: data as Customer };
  }
  const response = await api.post<{ message: string; data: Customer }>('customers', data);
  return response.data;
}

export async function updateCustomer(id: number, data: Partial<Customer>): Promise<{ message: string; data: Customer }> {
  const response = await api.put<{ message: string; data: Customer }>(`customers/${id}`, data);
  return response.data;
}

export async function deleteCustomer(id: number): Promise<{ message: string }> {
  try {
    const response = await api.delete<{ message: string }>(`customers/${id}`);
    offline.removeCachedCustomer(id).catch(() => {});
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      offline.removeCachedCustomer(id).catch(() => {});
      return { message: 'Queued for sync when online' };
    }
    throw error;
  }
}

// Invoices
export async function getInvoices(params: {
  search?: string;
  status?: string;
  payment_status?: string;
  customer_id?: number;
  date_from?: string;
  date_to?: string;
  per_page?: number;
  page?: number;
} = {}): Promise<PaginatedResponse<InvoiceListItem>> {
  try {
    const response = await api.get<PaginatedResponse<InvoiceListItem>>('invoices', { params });
    if (response.data?.data) {
      offline.cacheInvoices(response.data.data).catch(() => {});
    }
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      const cached = await offline.getCachedInvoices();
      return {
        data: cached,
        meta: { current_page: 1, last_page: 1, per_page: cached.length, total: cached.length },
      };
    }
    throw error;
  }
}

export async function getInvoice(id: number): Promise<{ data: Invoice }> {
  try {
    const response = await api.get<{ data: Invoice }>(`invoices/${id}`);
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      const cached = await offline.getCachedInvoice(id);
      if (cached) return { data: cached as unknown as Invoice };
    }
    throw error;
  }
}

export async function createInvoice(data: {
  customer_id?: number;
  issue_date: string;
  due_date?: string;
  discount?: number;
  tax?: number;
  notes?: string;
  currency?: string;
  payment_method?: string;
  items: {
    product_id: number;
    description: string;
    quantity: number;
    unit_price: number;
    discount?: number;
    tax?: number;
  }[];
}): Promise<{ message: string; data: Invoice }> {
  if (!(await isOnline())) {
    await enqueue('invoices', 'POST', data);
    return { message: 'Queued for sync when online', data: { id: 0, invoice_number: '...', status: 'draft', payment_status: 'unpaid', total: 0, subtotal: 0, discount: 0, tax: 0, paid_amount: 0, balance_due: 0, issue_date: '', currency: 'RWF', notes: null, payment_method: null, tenant_id: 0, customer_id: null, created_at: '', updated_at: '' } as Invoice };
  }
  const response = await api.post<{ message: string; data: Invoice }>('invoices', data);
  if (response.data?.data) {
    offline.cacheInvoice(response.data.data as unknown as InvoiceListItem).catch(() => {});
  }
  return response.data;
}

export async function confirmInvoice(id: number): Promise<{ message: string; data: Invoice }> {
  const response = await api.post<{ message: string; data: Invoice }>(`invoices/${id}/confirm`);
  return response.data;
}

export async function updateInvoice(id: number, data: Partial<Invoice> & { items?: any[] }): Promise<{ message: string; data: Invoice }> {
  const response = await api.put<{ message: string; data: Invoice }>(`invoices/${id}`, data);
  return response.data;
}

export async function downloadInvoicePdf(id: number): Promise<string> {
  const response = await api.get(`invoices/${id}/pdf`, {
    responseType: 'arraybuffer',
  });
  const destFile = new File(Paths.cache, `invoice-${id}.pdf`);
  destFile.write(new Uint8Array(response.data));
  return destFile.uri;
}

export async function viewInvoicePdf(id: number): Promise<void> {
  const response = await api.get(`invoices/${id}/pdf`, {
    responseType: 'arraybuffer',
  });
  const file = new File(Paths.cache, `invoice-${id}.pdf`);
  file.write(new Uint8Array(response.data));
  const uri = Platform.OS === 'android' ? file.contentUri : file.uri;
  await Linking.openURL(uri);
}

export async function deleteInvoice(id: number): Promise<{ message: string }> {
  try {
    const response = await api.delete<{ message: string }>(`invoices/${id}`);
    offline.removeCachedInvoice(id).catch(() => {});
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      offline.removeCachedInvoice(id).catch(() => {});
      return { message: 'Queued for sync when online' };
    }
    throw error;
  }
}

// Quotations
export async function getQuotations(params: {
  search?: string;
  status?: string;
  customer_id?: number;
  per_page?: number;
  page?: number;
} = {}): Promise<PaginatedResponse<Quotation>> {
  try {
    const response = await api.get<PaginatedResponse<Quotation>>('quotations', { params });
    if (response.data?.data) {
      offline.cacheQuotations(response.data.data).catch(() => {});
    }
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      const cached = await offline.getCachedQuotations();
      return {
        data: cached,
        meta: { current_page: 1, last_page: 1, per_page: cached.length, total: cached.length },
      };
    }
    throw error;
  }
}

export async function getQuotation(id: number): Promise<{ data: Quotation }> {
  const response = await api.get<{ data: Quotation }>(`quotations/${id}`);
  return response.data;
}

export async function createQuotation(data: Partial<Quotation>): Promise<{ message: string; data: Quotation }> {
  if (!(await isOnline())) {
    await enqueue('quotations', 'POST', data);
    return { message: 'Queued for sync when online', data: data as Quotation };
  }
  const response = await api.post<{ message: string; data: Quotation }>('quotations', data);
  return response.data;
}

export async function deleteQuotation(id: number): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`quotations/${id}`);
  return response.data;
}

// Receipts
export async function getReceipts(params: {
  search?: string;
  invoice_id?: number;
  payment_method?: string;
  per_page?: number;
  page?: number;
} = {}): Promise<PaginatedResponse<Receipt>> {
  try {
    const response = await api.get<PaginatedResponse<Receipt>>('receipts', { params });
    if (response.data?.data) {
      offline.cacheReceipts(response.data.data).catch(() => {});
    }
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      const cached = await offline.getCachedReceipts();
      return {
        data: cached,
        meta: { current_page: 1, last_page: 1, per_page: cached.length, total: cached.length },
      };
    }
    throw error;
  }
}

export async function getReceipt(id: number): Promise<{ data: Receipt }> {
  const response = await api.get<{ data: Receipt }>(`receipts/${id}`);
  return response.data;
}

export async function createReceipt(data: {
  invoice_id?: number;
  customer_id?: number;
  amount: number;
  payment_method: string;
  reference?: string;
  receipt_date: string;
  notes?: string;
}): Promise<{ message: string; data: Receipt }> {
  if (!(await isOnline())) {
    await enqueue('receipts', 'POST', data);
    return { message: 'Queued for sync when online', data: { id: 0, tenant_id: 0, invoice_id: data.invoice_id ?? null, customer_id: data.customer_id ?? null, receipt_number: '...', amount: data.amount, payment_method: data.payment_method as Receipt['payment_method'], reference: data.reference ?? null, receipt_date: data.receipt_date, notes: null, created_at: '', updated_at: '' } };
  }
  const response = await api.post<{ message: string; data: Receipt }>('receipts', data);
  return response.data;
}

export async function deleteReceipt(id: number): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`receipts/${id}`);
  return response.data;
}
