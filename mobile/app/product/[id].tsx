import { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image, Linking, View, Modal, Pressable, Alert, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import * as inventoryService from '@/src/services/inventory';
import type { Product, StockMovement, Category } from '@/src/types/inventory';

function CategorySelector({ categories, selectedId, onSelect }: { categories: Category[]; selectedId: number | null; onSelect: (id: number | null) => void }) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.id === selectedId);
  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)} className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 border border-gray-200 dark:border-gray-700 flex-row items-center justify-between active:opacity-80">
        <ThemedText className={selected ? 'text-gray-900 dark:text-white text-sm' : 'text-gray-400 text-sm'}>
          {selected ? selected.name : 'No category'}
        </ThemedText>
        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40 justify-center px-6" onPress={() => setOpen(false)}>
          <Pressable className="bg-white dark:bg-gray-800 rounded-3xl max-h-72 overflow-hidden" onPress={() => {}}>
            <View className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex-row items-center justify-between">
              <ThemedText className="text-gray-900 dark:text-white font-bold text-sm">Select Category</ThemedText>
              <TouchableOpacity onPress={() => setOpen(false)}><Ionicons name="close" size={20} color="#9CA3AF" /></TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => { onSelect(item.id); setOpen(false); }}
                  className={`px-5 py-3.5 flex-row items-center justify-between ${selectedId === item.id ? 'bg-primary/5' : ''}`}>
                  <ThemedText className={`text-sm ${selectedId === item.id ? 'text-primary font-bold' : 'text-gray-900 dark:text-white'}`}>{item.name}</ThemedText>
                  {selectedId === item.id && <Ionicons name="checkmark" size={18} color="#0a7ea4" />}
                </TouchableOpacity>
              )}
            />
            {selectedId !== null && (
              <TouchableOpacity onPress={() => { onSelect(null); setOpen(false); }} className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-700 flex-row items-center gap-2">
                <Ionicons name="close-outline" size={16} color="#ef4444" />
                <ThemedText className="text-red-500 text-sm font-medium">Clear selection</ThemedText>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [invoices, setInvoices] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPricing, setEditPricing] = useState(false);
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [priceSubmitting, setPriceSubmitting] = useState(false);
  const [editInfo, setEditInfo] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editBarcode, setEditBarcode] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editInfoSubmitting, setEditInfoSubmitting] = useState(false);

  useEffect(() => { if (id) loadProduct(); }, [id]);

  async function loadCategories() {
    try {
      const res = await inventoryService.getCategories({ per_page: 100 });
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch {}
  }

  function openEditInfo() {
    if (!product) return;
    setEditName(product.name);
    setEditSku(product.sku ?? '');
    setEditBarcode(product.barcode ?? '');
    setEditDescription(product.description ?? '');
    setEditCategory(product.category_id);
    loadCategories();
    setEditInfo(true);
  }

  async function handleSaveInfo() {
    if (!product || !editName.trim()) return;
    setEditInfoSubmitting(true);
    try {
      await inventoryService.updateProduct(product.id, {
        name: editName.trim(),
        sku: editSku.trim() || undefined,
        barcode: editBarcode.trim() || undefined,
        description: editDescription.trim() || undefined,
        category_id: editCategory ?? undefined,
      });
      setEditInfo(false);
      setLoading(true);
      await loadProduct();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to update product');
    } finally {
      setEditInfoSubmitting(false);
    }
  }

  async function loadProduct() {
    try {
      const [prodRes, movRes] = await Promise.all([
        inventoryService.getProduct(Number(id)),
        inventoryService.getStockMovements({ product_id: Number(id), per_page: 50 }),
      ]);
      setProduct(prodRes.data);
      setInvoices(movRes.data.filter((m) => m.type === 'stock_in' && m.invoice_url));
    } catch { } finally { setLoading(false); }
  }

  function openPricing() {
    if (!product) return;
    setCostPrice(product.cost_price ? String(product.cost_price) : '');
    setSellingPrice(product.selling_price ? String(product.selling_price) : '');
    setEditUnit(product.unit ?? '');
    setEditPricing(true);
  }

  async function handleSavePrices() {
    if (!product) return;
    const cp = costPrice ? Number(costPrice) : 0;
    const sp = sellingPrice ? Number(sellingPrice) : 0;
    const un = editUnit.trim() || undefined;
    setPriceSubmitting(true);
    try {
      await inventoryService.updateProduct(product.id, { cost_price: cp, selling_price: sp, unit: un });
      setEditPricing(false);
      setLoading(true);
      await loadProduct();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to update prices');
    } finally {
      setPriceSubmitting(false);
    }
  }

  function handleMoveStock() {
    if (!product) return;
    const hasPrices = product.cost_price > 0 || product.selling_price > 0;
    if (!hasPrices) {
      Alert.alert('Prices Required', 'Set cost and selling prices before moving stock. This prevents selling items without a price.');
      return;
    }
    router.push(`/stock-movement?product_id=${product.id}`);
  }

  if (loading) return <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-950"><ActivityIndicator size="large" color="#0a7ea4" /></View>;
  if (!product) return <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-950"><ThemedText className="text-gray-500">Product not found</ThemedText></View>;

  const hasPrices = product.cost_price > 0 || product.selling_price > 0;

  const infoRows = [
    { label: 'SKU', value: product.sku ?? '-' },
    { label: 'Barcode', value: product.barcode ?? '-' },
    { label: 'Category', value: product.category?.name ?? '-' },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" contentContainerStyle={{ paddingBottom: 100 }}>
      <LinearGradient colors={['#0a1f2e', '#0f4e6b', '#0a7ea4']} className="px-6 pt-12 pb-8 rounded-b-[32px]">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center mb-5 active:bg-white/25 border border-white/10">
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-4">
          <View className="w-16 h-16 bg-white/10 rounded-2xl items-center justify-center border border-white/10">
            <Ionicons name="cube" size={32} color="#fff" />
          </View>
          <View className="flex-1">
            <ThemedText className="text-white text-2xl font-bold tracking-tight">{product.name}</ThemedText>
            <View className="flex-row items-center gap-2 mt-2">
              <View className={`px-3 py-1 rounded-full ${product.total_stock > 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                <ThemedText className={`text-[11px] font-bold ${product.total_stock > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {product.total_stock > 0 ? `${product.total_stock} in stock` : 'Out of stock'}
                </ThemedText>
              </View>
              <View className={`px-3 py-1 rounded-full ${product.is_active ? 'bg-emerald-500/20' : 'bg-gray-500/20'}`}>
                <ThemedText className={`text-[11px] font-bold ${product.is_active ? 'text-emerald-300' : 'text-gray-300'}`}>{product.is_active ? 'Active' : 'Inactive'}</ThemedText>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View className="px-4 -mt-5 gap-3.5">
        <View className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2.5">
              <View className="w-8 h-8 rounded-2xl bg-primary/10 items-center justify-center border border-primary/5"><Ionicons name="information-circle-outline" size={16} color="#0a7ea4" /></View>
              <ThemedText className="text-gray-900 dark:text-white font-bold text-base">Product Info</ThemedText>
            </View>
            <TouchableOpacity onPress={openEditInfo} className="bg-primary/10 px-4 py-2 rounded-xl active:opacity-80">
              <ThemedText className="text-primary text-xs font-bold">Edit</ThemedText>
            </TouchableOpacity>
          </View>
          <View className="gap-2.5">
            {infoRows.map((row) => (
              <View key={row.label} className="flex-row items-center justify-between py-1.5">
                <ThemedText className="text-gray-400 dark:text-gray-500 text-sm">{row.label}</ThemedText>
                <ThemedText className="text-gray-900 dark:text-white text-sm font-semibold">{row.value}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2.5">
              <View className="w-8 h-8 rounded-2xl bg-primary/10 items-center justify-center border border-primary/5"><Ionicons name="pricetag-outline" size={16} color="#0a7ea4" /></View>
              <View><ThemedText className="text-gray-900 dark:text-white font-bold text-base">Pricing</ThemedText><ThemedText className="text-gray-400 dark:text-gray-500 text-[10px]">{hasPrices ? 'Cost & selling prices' : 'Not configured'}</ThemedText></View>
            </View>
            <TouchableOpacity onPress={openPricing} className="bg-primary/10 px-4 py-2 rounded-xl active:opacity-80">
              <ThemedText className="text-primary text-xs font-bold">{hasPrices ? 'Edit' : 'Set Prices'}</ThemedText>
            </TouchableOpacity>
          </View>
          {hasPrices ? (
            <View className="gap-2.5">
              <View className="flex-row items-center justify-between py-1.5">
                <ThemedText className="text-gray-400 dark:text-gray-500 text-sm">Cost Price</ThemedText>
                <ThemedText className="text-gray-900 dark:text-white text-sm font-semibold">${product.cost_price.toFixed(2)}</ThemedText>
              </View>
              <View className="flex-row items-center justify-between py-1.5">
                <ThemedText className="text-gray-400 dark:text-gray-500 text-sm">Selling Price</ThemedText>
                <ThemedText className="text-gray-900 dark:text-white text-sm font-semibold">${product.selling_price.toFixed(2)}</ThemedText>
              </View>
              {product.unit && (
                <View className="flex-row items-center justify-between py-1.5">
                  <ThemedText className="text-gray-400 dark:text-gray-500 text-sm">Unit</ThemedText>
                  <ThemedText className="text-gray-900 dark:text-white text-sm font-semibold">{product.unit}</ThemedText>
                </View>
              )}
              <View className="flex-row items-center justify-between py-1.5 border-t border-gray-100 dark:border-gray-700 mt-1 pt-3">
                <ThemedText className="text-gray-400 dark:text-gray-500 text-sm">Margin</ThemedText>
                <ThemedText className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                  {product.cost_price > 0 ? `${((product.selling_price - product.cost_price) / product.cost_price * 100).toFixed(1)}%` : '-'}
                </ThemedText>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={openPricing} className="py-4 border-2 border-dashed border-primary/30 rounded-2xl items-center gap-2 active:opacity-80">
              <Ionicons name="pricetag-outline" size={24} color="#0a7ea4" />
              <ThemedText className="text-primary font-bold text-sm">Set Cost & Selling Prices</ThemedText>
              <ThemedText className="text-gray-400 dark:text-gray-500 text-[10px]">Required before selling stock</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {product.warehouses && product.warehouses.length > 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center gap-2.5 mb-4">
              <View className="w-8 h-8 rounded-2xl bg-primary/10 items-center justify-center border border-primary/5"><Ionicons name="business-outline" size={16} color="#0a7ea4" /></View>
              <ThemedText className="text-gray-900 dark:text-white font-bold text-base">Stock by Warehouse</ThemedText>
            </View>
            <View className="gap-2.5">
              {product.warehouses.map((wh) => (
                <View key={wh.id} className="flex-row items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                  <View className="flex-row items-center gap-2.5">
                    <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center"><Ionicons name="business-outline" size={14} color="#0a7ea4" /></View>
                    <ThemedText className="text-gray-900 dark:text-white text-sm font-medium">{wh.name}</ThemedText>
                  </View>
                  <ThemedText className={`font-bold text-base ${wh.pivot && wh.pivot.quantity > 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                    {wh.pivot?.quantity ?? 0}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {invoices.length > 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2.5">
                <View className="w-8 h-8 rounded-2xl bg-primary/10 items-center justify-center border border-primary/5"><Ionicons name="receipt-outline" size={16} color="#0a7ea4" /></View>
                <ThemedText className="text-gray-900 dark:text-white font-bold text-base">Invoices</ThemedText>
              </View>
              <View className="bg-primary/10 px-3 py-1 rounded-full"><ThemedText className="text-primary text-[10px] font-bold">{invoices.length} file{invoices.length > 1 ? 's' : ''}</ThemedText></View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
              <View className="flex-row gap-3 pl-1">
                {invoices.map((inv) => (
                  <TouchableOpacity key={inv.id} onPress={() => inv.invoice_url && Linking.openURL(inv.invoice_url)} activeOpacity={0.8}>
                    <View className="w-36">
                      <View className="w-36 h-44 bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <Image source={{ uri: inv.invoice_url! }} className="w-full h-full" resizeMode="cover" />
                        <View className="absolute bottom-0 left-0 right-0 px-3 py-2.5" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                          <ThemedText className="text-white text-[11px] font-bold">{new Date(inv.created_at).toLocaleDateString()}</ThemedText>
                          <ThemedText className="text-white/60 text-[9px]">+{inv.quantity} units</ThemedText>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <TouchableOpacity onPress={handleMoveStock} className="bg-gray-900 dark:bg-white rounded-2xl py-4 items-center flex-row justify-center gap-2 active:opacity-80">
          <Ionicons name="swap-horizontal-outline" size={20} color="#fff" />
          <ThemedText className="text-white dark:text-gray-900 font-bold text-sm">Move Stock</ThemedText>
        </TouchableOpacity>

        {product.description && (
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 mb-4">
            <View className="flex-row items-center gap-2.5 mb-3">
              <View className="w-8 h-8 rounded-2xl bg-primary/10 items-center justify-center border border-primary/5"><Ionicons name="document-text-outline" size={16} color="#0a7ea4" /></View>
              <ThemedText className="text-gray-900 dark:text-white font-bold text-base">Description</ThemedText>
            </View>
            <ThemedText className="text-gray-500 dark:text-gray-400 text-sm leading-6">{product.description}</ThemedText>
          </View>
        )}
      </View>

      <Modal visible={editPricing} transparent animationType="fade" onRequestClose={() => setEditPricing(false)}>
        <Pressable className="flex-1 bg-black/40 justify-center px-6" onPress={() => setEditPricing(false)}>
          <Pressable className="bg-white dark:bg-gray-800 rounded-3xl p-6" onPress={() => {}}>
            <View className="flex-row items-center gap-3 mb-5">
              <View className="w-9 h-9 rounded-2xl bg-primary/10 items-center justify-center"><Ionicons name="pricetag-outline" size={18} color="#0a7ea4" /></View>
              <View><ThemedText className="text-gray-900 dark:text-white font-bold text-sm">Set Prices</ThemedText><ThemedText className="text-gray-400 dark:text-gray-500 text-[10px]">Configure cost and selling prices</ThemedText></View>
            </View>
            <View className="gap-3.5">
              <View>
                <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Cost Price ($)</ThemedText>
                <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700" value={costPrice} onChangeText={setCostPrice} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="decimal-pad" />
              </View>
              <View>
                <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Selling Price ($)</ThemedText>
                <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700" value={sellingPrice} onChangeText={setSellingPrice} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="decimal-pad" />
              </View>
              <View>
                <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Unit</ThemedText>
                <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700" value={editUnit} onChangeText={setEditUnit} placeholder="pcs" placeholderTextColor="#9CA3AF" />
              </View>
            </View>
            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity onPress={() => setEditPricing(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl py-3.5 items-center active:opacity-80">
                <ThemedText className="text-gray-600 dark:text-gray-400 font-bold text-sm">Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSavePrices} disabled={priceSubmitting} className="flex-1 bg-gray-900 dark:bg-white rounded-2xl py-3.5 items-center active:opacity-80">
                {priceSubmitting ? <ActivityIndicator color="#fff" /> : <ThemedText className="text-white dark:text-gray-900 font-bold text-sm">Save</ThemedText>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={editInfo} transparent animationType="fade" onRequestClose={() => setEditInfo(false)}>
        <Pressable className="flex-1 bg-black/40 justify-center px-6" onPress={() => setEditInfo(false)}>
          <Pressable className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-h-[85%]" onPress={() => {}}>
            <ScrollView>
              <View className="flex-row items-center gap-3 mb-5">
                <View className="w-9 h-9 rounded-2xl bg-primary/10 items-center justify-center"><Ionicons name="pencil-outline" size={18} color="#0a7ea4" /></View>
                <View><ThemedText className="text-gray-900 dark:text-white font-bold text-sm">Edit Product</ThemedText><ThemedText className="text-gray-400 dark:text-gray-500 text-[10px]">Update product details</ThemedText></View>
              </View>
              <View className="gap-3.5">
                <View>
                  <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Name *</ThemedText>
                  <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700" value={editName} onChangeText={setEditName} placeholder="Product name" placeholderTextColor="#9CA3AF" />
                </View>
                <View className="flex-row gap-2.5">
                  <View className="flex-1">
                    <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">SKU</ThemedText>
                    <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700" value={editSku} onChangeText={setEditSku} placeholder="SKU" placeholderTextColor="#9CA3AF" />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Barcode</ThemedText>
                    <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700" value={editBarcode} onChangeText={setEditBarcode} placeholder="Barcode" placeholderTextColor="#9CA3AF" />
                  </View>
                </View>
                <View>
                  <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Category</ThemedText>
                  <CategorySelector categories={categories} selectedId={editCategory} onSelect={setEditCategory} />
                </View>
                <View>
                  <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Description</ThemedText>
                  <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm min-h-[80px] border border-gray-200 dark:border-gray-700" value={editDescription} onChangeText={setEditDescription} placeholder="Optional description" placeholderTextColor="#9CA3AF" multiline numberOfLines={3} textAlignVertical="top" />
                </View>
              </View>
              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity onPress={() => setEditInfo(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl py-3.5 items-center active:opacity-80">
                  <ThemedText className="text-gray-600 dark:text-gray-400 font-bold text-sm">Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveInfo} disabled={editInfoSubmitting || !editName.trim()} className="flex-1 bg-gray-900 dark:bg-white rounded-2xl py-3.5 items-center active:opacity-80">
                  {editInfoSubmitting ? <ActivityIndicator color="#fff" /> : <ThemedText className="text-white dark:text-gray-900 font-bold text-sm">Save</ThemedText>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
