import { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, TextInput, View, ActivityIndicator, Alert, FlatList, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import * as salesService from '@/src/services/sales';
import * as inventoryService from '@/src/services/inventory';
import type { ProductListItem } from '@/src/types/inventory';
import type { CustomerListItem } from '@/src/types/sales';

const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: 'cash-outline' as const },
  { id: 'mobile_money', label: 'Mobile Money', icon: 'phone-portrait-outline' as const },
  { id: 'bank', label: 'Bank', icon: 'business-outline' as const },
  { id: 'card', label: 'Card', icon: 'card-outline' as const },
  { id: 'credit', label: 'Credit (Pay Later)', icon: 'time-outline' as const },
];

interface LineItem {
  product_id: number | null;
  description: string;
  quantity: string;
  unit_price: string;
  discount: string;
  tax: string;
  available_stock: number;
}

export default function AddInvoiceScreen() {
  const [customerModal, setCustomerModal] = useState(false);
  const [productModal, setProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerListItem | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [items, setItems] = useState<LineItem[]>([
    { product_id: null, description: '', quantity: '1', unit_price: '0', discount: '0', tax: '0', available_stock: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCustomers(''); }, []);

  async function loadCustomers(search: string) {
    try {
      const res = await salesService.getCustomers({ search: search || undefined, per_page: 20 });
      setCustomers(res.data);
    } catch {}
  }

  async function loadProducts(search: string) {
    try {
      const res = await inventoryService.getProducts({ search: search || undefined, per_page: 20 });
      setProducts(res.data);
    } catch {}
  }

  function openProductSearch(index: number) {
    setActiveItemIndex(index);
    setProductSearch('');
    loadProducts('');
    setProductModal(true);
  }

  function selectProduct(product: ProductListItem) {
    const updated = [...items];
    updated[activeItemIndex] = {
      ...updated[activeItemIndex],
      product_id: product.id,
      description: product.name,
      unit_price: String(product.selling_price),
      available_stock: product.total_stock,
    };
    setItems(updated);
    setProductModal(false);
  }

  function addItem() {
    setItems([...items, { product_id: null, description: '', quantity: '1', unit_price: '0', discount: '0', tax: '0', available_stock: 0 }]);
  }

  function updateItem(index: number, field: keyof LineItem, value: string) {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === 'quantity' && Number(value) > updated[index].available_stock) {
      Alert.alert('Low Stock', `Only ${updated[index].available_stock} units available`);
    }
    setItems(updated);
  }

  function removeItem(index: number) {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.quantity || '0') * parseFloat(i.unit_price || '0')), 0);
  const discountVal = parseFloat(discount || '0');
  const taxVal = parseFloat(tax || '0');
  const total = subtotal - discountVal + taxVal;
  const isCredit = paymentMethod === 'credit';

  async function handleSave() {
    if (items.some(i => !i.product_id)) {
      Alert.alert('Error', 'Each item must have a product selected');
      return;
    }
    setSaving(true);
    try {
      const invoiceData = {
        customer_id: selectedCustomer?.id,
        issue_date: issueDate,
        due_date: dueDate || undefined,
        discount: discountVal || undefined,
        tax: taxVal || undefined,
        notes: notes || undefined,
        payment_method: paymentMethod,
        items: items.map(i => ({
          product_id: i.product_id!,
          description: i.description,
          quantity: parseFloat(i.quantity),
          unit_price: parseFloat(i.unit_price),
          discount: parseFloat(i.discount || '0'),
          tax: parseFloat(i.tax || '0'),
        })),
      };

      const inv = await salesService.createInvoice(invoiceData);
      const invoiceId = inv.data?.id;
      if (!invoiceId) throw new Error('Invoice created but no ID returned');

      if (isCredit) {
        Alert.alert('Success', 'Credit invoice created. Confirm on next screen to deduct stock.');
        router.push({ pathname: '/invoice/[id]', params: { id: String(invoiceId) } });
      } else {
        Alert.alert('Success', 'Invoice paid. Stock deducted and receipt generated.');
        router.back();
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Something went wrong';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <LinearGradient colors={['#064e3b', '#059669', '#06b884']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.2 }} className="px-6 pt-12 pb-6 rounded-b-[32px]">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center">
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View>
            <ThemedText className="text-white/50 text-xs font-medium tracking-widest uppercase">New</ThemedText>
            <ThemedText className="text-white text-2xl font-bold">Invoice</ThemedText>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="-mt-4 px-4 gap-4">
          {/* Customer */}
          <TouchableOpacity onPress={() => { setCustomerSearch(''); loadCustomers(''); setCustomerModal(true); }} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center">
              <Ionicons name="person-outline" size={20} color="#059669" />
            </View>
            <View className="flex-1">
              <ThemedText className="text-gray-400 text-xs">Customer</ThemedText>
              <ThemedText className={`text-sm font-semibold ${selectedCustomer ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {selectedCustomer?.name ?? 'Walk-in Customer'}
              </ThemedText>
            </View>
            <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Payment Method */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <ThemedText className="text-gray-400 text-xs mb-3">Payment Method</ThemedText>
            <View className="flex-row flex-wrap gap-2">
              {paymentMethods.map(m => (
                <TouchableOpacity key={m.id} onPress={() => setPaymentMethod(m.id)} className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${paymentMethod === m.id ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'}`}>
                  <Ionicons name={m.icon} size={14} color={paymentMethod === m.id ? '#059669' : '#9CA3AF'} />
                  <ThemedText className={`text-xs font-semibold ${paymentMethod === m.id ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}`}>{m.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            {isCredit && (
              <View className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl px-3 py-2 mt-3 flex-row items-center gap-2">
                <Ionicons name="information-circle" size={16} color="#d97706" />
                <ThemedText className="text-yellow-700 dark:text-yellow-400 text-xs flex-1">Customer will pay later. Balance of RWF {total.toLocaleString()} will be due.</ThemedText>
              </View>
            )}
            {!isCredit && (
              <View className="bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2 mt-3 flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <ThemedText className="text-green-700 dark:text-green-400 text-xs flex-1">Invoice will be marked as paid.</ThemedText>
              </View>
            )}
          </View>

          {/* Date */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <ThemedText className="text-gray-400 text-xs mb-1">Issue Date</ThemedText>
                <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm" value={issueDate} onChangeText={setIssueDate} />
              </View>
              <View className="flex-1">
                <ThemedText className="text-gray-400 text-xs mb-1">Due Date</ThemedText>
                <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm" placeholder="Optional" placeholderTextColor="#9CA3AF" value={dueDate} onChangeText={setDueDate} />
              </View>
            </View>
          </View>

          {/* Items */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center justify-between mb-3">
              <ThemedText className="text-gray-900 dark:text-white font-bold text-sm">Items</ThemedText>
              <TouchableOpacity onPress={addItem} className="bg-green-500 px-3 py-1.5 rounded-xl flex-row items-center gap-1">
                <Ionicons name="add" size={14} color="#fff" />
                <ThemedText className="text-white text-xs font-bold">Add</ThemedText>
              </TouchableOpacity>
            </View>
            {items.map((item, i) => (
              <View key={i} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 mb-2">
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity onPress={() => openProductSearch(i)} className="flex-1 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 flex-row items-center justify-between border border-gray-200 dark:border-gray-700">
                    <ThemedText className={`text-sm ${item.product_id ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`} numberOfLines={1}>
                      {item.description || 'Select product...'}
                    </ThemedText>
                    <Ionicons name="search" size={14} color="#9CA3AF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeItem(i)} className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center">
                    <Ionicons name="close" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                {item.product_id && (
                  <View className="flex-row items-center gap-2 mt-1">
                    <ThemedText className={`text-xs ${Number(item.quantity) > item.available_stock ? 'text-red-500' : item.available_stock < 10 ? 'text-yellow-500' : 'text-green-500'}`}>
                      Stock: {item.available_stock}
                    </ThemedText>
                    <ThemedText className="text-gray-300">|</ThemedText>
                    <ThemedText className="text-gray-400 text-xs">RWF {Number(item.unit_price).toLocaleString()}/unit</ThemedText>
                  </View>
                )}
                <View className="flex-row gap-2 mt-2">
                  <View className="flex-1">
                    <ThemedText className="text-gray-400 text-[10px] mb-0.5">Qty</ThemedText>
                    <TextInput className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm" keyboardType="decimal-pad" value={item.quantity} onChangeText={(v) => updateItem(i, 'quantity', v)} />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="text-gray-400 text-[10px] mb-0.5">Price</ThemedText>
                    <TextInput className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm" keyboardType="decimal-pad" value={item.unit_price} onChangeText={(v) => updateItem(i, 'unit_price', v)} />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="text-gray-400 text-[10px] mb-0.5">Disc</ThemedText>
                    <TextInput className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm" keyboardType="decimal-pad" value={item.discount} onChangeText={(v) => updateItem(i, 'discount', v)} />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="text-gray-400 text-[10px] mb-0.5">Tax</ThemedText>
                    <TextInput className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm" keyboardType="decimal-pad" value={item.tax} onChangeText={(v) => updateItem(i, 'tax', v)} />
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Summary */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <View className="gap-2">
              <View className="flex-row justify-between">
                <ThemedText className="text-gray-400 text-sm">Subtotal</ThemedText>
                <ThemedText className="text-gray-900 dark:text-white">RWF {subtotal.toLocaleString()}</ThemedText>
              </View>
              <View className="flex-row items-center justify-between">
                <ThemedText className="text-gray-400 text-sm">Discount</ThemedText>
                <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white text-sm w-24 text-right" keyboardType="decimal-pad" value={discount} onChangeText={setDiscount} />
              </View>
              <View className="flex-row items-center justify-between">
                <ThemedText className="text-gray-400 text-sm">Tax</ThemedText>
                <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white text-sm w-24 text-right" keyboardType="decimal-pad" value={tax} onChangeText={setTax} />
              </View>
              <View className="border-t border-gray-100 dark:border-gray-700 pt-2 mt-1">
                <View className="flex-row justify-between">
                  <ThemedText className="text-gray-900 dark:text-white font-bold text-base">Total</ThemedText>
                  <ThemedText className="text-green-600 font-bold text-base">RWF {total.toLocaleString()}</ThemedText>
                </View>
                {isCredit && (
                  <View className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl px-3 py-2 mt-2 flex-row items-center gap-2">
                    <Ionicons name="alert-circle" size={14} color="#d97706" />
                    <ThemedText className="text-yellow-600 text-xs">Balance due: RWF {total.toLocaleString()}</ThemedText>
                  </View>
                )}
              </View>
            </View>
          </View>

          <TextInput className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm border border-gray-100 dark:border-gray-700" placeholder="Notes" placeholderTextColor="#9CA3AF" value={notes} onChangeText={setNotes} multiline />

          {/* Action Button */}
          <TouchableOpacity onPress={handleSave} disabled={saving} className={`py-4 rounded-2xl items-center active:opacity-80 flex-row justify-center gap-2 ${isCredit ? 'bg-yellow-500' : 'bg-green-600'}`}>
            {saving ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name={isCredit ? 'time-outline' : 'checkmark-circle'} size={20} color="#fff" />
                <ThemedText className="text-white font-bold text-base">
                  {isCredit ? 'Create Credit Invoice' : paymentMethod === 'cash' ? 'Receive Cash & Complete' : `Process ${paymentMethod === 'mobile_money' ? 'Mobile Payment' : 'Payment'} & Complete`}
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Customer Modal */}
      <Modal visible={customerModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-gray-50 dark:bg-gray-950 pt-12">
          <View className="flex-row items-center justify-between px-6 pb-4">
            <ThemedText className="text-gray-900 dark:text-white text-xl font-bold">Select Customer</ThemedText>
            <TouchableOpacity onPress={() => setCustomerModal(false)} className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl items-center justify-center">
              <Ionicons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <View className="px-6 mb-4">
            <TextInput className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700" placeholder="Search customers..." placeholderTextColor="#9CA3AF" value={customerSearch} onChangeText={(v) => { setCustomerSearch(v); loadCustomers(v); }} />
          </View>
          <FlatList data={customers} keyExtractor={(c) => String(c.id)} contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
            ListHeaderComponent={
              <TouchableOpacity onPress={() => { setSelectedCustomer(null); setCustomerModal(false); }} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 border-dashed flex-row items-center gap-3 mb-1">
                <View className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 items-center justify-center">
                  <Ionicons name="person-add-outline" size={20} color="#9CA3AF" />
                </View>
                <ThemedText className="text-gray-500 text-sm font-semibold">Walk-in Customer (no name)</ThemedText>
              </TouchableOpacity>
            }
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => { setSelectedCustomer(item); setCustomerModal(false); }} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center">
                  <Ionicons name="person" size={20} color="#059669" />
                </View>
                <View className="flex-1">
                  <ThemedText className="text-gray-900 dark:text-white font-semibold text-sm">{item.name}</ThemedText>
                  <ThemedText className="text-gray-400 text-xs">{item.email ?? item.phone ?? 'No contact'}</ThemedText>
                </View>
                <ThemedText className="text-gray-500 font-bold text-xs">RWF {Number(item.total_purchases).toLocaleString()}</ThemedText>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<View className="items-center py-10"><ThemedText className="text-gray-400">No customers</ThemedText></View>}
          />
        </View>
      </Modal>

      {/* Product Modal */}
      <Modal visible={productModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-gray-50 dark:bg-gray-950 pt-12">
          <View className="flex-row items-center justify-between px-6 pb-4">
            <ThemedText className="text-gray-900 dark:text-white text-xl font-bold">Select Product</ThemedText>
            <TouchableOpacity onPress={() => setProductModal(false)} className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl items-center justify-center">
              <Ionicons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <View className="px-6 mb-4">
            <TextInput className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700" placeholder="Search products..." placeholderTextColor="#9CA3AF" value={productSearch} onChangeText={(v) => { setProductSearch(v); loadProducts(v); }} />
          </View>
          <FlatList data={products} keyExtractor={(p) => String(p.id)} contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => selectProduct(item)} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center">
                  <Ionicons name="cube" size={20} color="#0a7ea4" />
                </View>
                <View className="flex-1 min-w-0">
                  <ThemedText className="text-gray-900 dark:text-white font-semibold text-sm" numberOfLines={1}>{item.name}</ThemedText>
                  <View className="flex-row items-center gap-2 mt-0.5">
                    {item.sku && <ThemedText className="text-gray-400 text-xs">{item.sku}</ThemedText>}
                    {item.sku && <View className="w-0.5 h-0.5 rounded-full bg-gray-300" />}
                    <ThemedText className={`text-xs font-semibold ${item.total_stock <= 0 ? 'text-red-500' : item.total_stock < 10 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {item.total_stock} in stock
                    </ThemedText>
                  </View>
                </View>
                <ThemedText className="text-gray-900 dark:text-white font-bold text-sm">RWF {item.selling_price.toLocaleString()}</ThemedText>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<View className="items-center py-10"><ThemedText className="text-gray-400">No products</ThemedText></View>}
          />
        </View>
      </Modal>
    </View>
  );
}
