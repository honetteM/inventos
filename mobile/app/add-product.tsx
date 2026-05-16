import { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, View, Modal, FlatList, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as inventoryService from '@/src/services/inventory';
import { uploadImage } from '@/src/services/cloudinary';
import type { Category, Warehouse } from '@/src/types/inventory';

type SelectorItem = { id: number; name: string };

function Selector({ items, selectedId, placeholder, onSelect }: {
  items: SelectorItem[]; selectedId: number | null; placeholder: string; onSelect: (id: number | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.id === selectedId);
  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)} className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 border border-gray-200 dark:border-gray-700 flex-row items-center justify-between active:opacity-80">
        <ThemedText className={selected ? 'text-gray-900 dark:text-white text-sm' : 'text-gray-400 text-sm'}>
          {selected ? selected.name : placeholder}
        </ThemedText>
        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40 justify-center px-6" onPress={() => setOpen(false)}>
          <Pressable className="bg-white dark:bg-gray-800 rounded-3xl max-h-72 overflow-hidden" onPress={() => {}}>
            <View className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex-row items-center justify-between">
              <ThemedText className="text-gray-900 dark:text-white font-bold text-sm">{placeholder}</ThemedText>
              <TouchableOpacity onPress={() => setOpen(false)}><Ionicons name="close" size={20} color="#9CA3AF" /></TouchableOpacity>
            </View>
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { onSelect(item.id); setOpen(false); }}
                  className={`px-5 py-3.5 flex-row items-center justify-between ${selectedId === item.id ? 'bg-primary/5' : ''}`}
                >
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

export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
  const [initialStock, setInitialStock] = useState('');
  const [invoiceImage, setInvoiceImage] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadFormData(); }, []);

  async function loadFormData() {
    try {
      const [catsRes, whsRes] = await Promise.all([
        inventoryService.getCategories({ per_page: 100 }),
        inventoryService.getWarehouses({ per_page: 100 }),
      ]);
      setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
      setWarehouses(whsRes.data);
      if (whsRes.data.length > 0) setSelectedWarehouse(whsRes.data[0].id);
    } catch {}
  }

  async function pickInvoice(fromCamera: boolean) {
    const permission = fromCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permission needed', fromCamera ? 'Camera access is required' : 'Gallery access is required'); return; }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true });
    if (!result.canceled && result.assets[0]) {
      setInvoiceImage(result.assets[0].uri);
      setInvoiceUrl(null);
      setUploadingInvoice(true);
      try { const url = await uploadImage(result.assets[0].uri); setInvoiceUrl(url); }
      catch (e: any) { Alert.alert('Upload failed', e.message); }
      finally { setUploadingInvoice(false); }
    }
  }

  async function handleSubmit() {
    if (!name.trim()) { Alert.alert('Error', 'Product name is required'); return; }
    if (selectedWarehouse && initialStock && Number(initialStock) > 0 && !invoiceUrl) { Alert.alert('Invoice required', 'Please attach an invoice image when adding initial stock'); return; }
    setSubmitting(true);
    try {
      const res = await inventoryService.createProduct({
        name: name.trim(), sku: sku.trim() || undefined, barcode: barcode.trim() || undefined,
        description: description.trim() || undefined,
        category_id: selectedCategory ?? undefined,
      });
      const product = res.data;
      if (selectedWarehouse && initialStock && Number(initialStock) > 0) {
        await inventoryService.createStockMovement({
          product_id: product.id, warehouse_id: selectedWarehouse, type: 'stock_in',
          quantity: Number(initialStock), notes: 'Initial stock on creation', invoice_url: invoiceUrl || undefined,
        });
      }
      Alert.alert('Success', 'Product created successfully', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) { Alert.alert('Error', e?.response?.data?.message ?? 'Failed to create product'); }
    finally { setSubmitting(false); }
  }

  const sectionHeader = (icon: keyof typeof Ionicons.glyphMap, title: string, subtitle: string) => (
    <View className="flex-row items-center gap-3 mb-4">
      <View className="w-9 h-9 rounded-2xl bg-primary/10 items-center justify-center border border-primary/5"><Ionicons name={icon} size={18} color="#0a7ea4" /></View>
      <View><ThemedText className="text-gray-900 dark:text-white font-bold text-sm">{title}</ThemedText><ThemedText className="text-gray-400 dark:text-gray-500 text-[10px]">{subtitle}</ThemedText></View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
      <LinearGradient colors={['#0a1f2e', '#0f4e6b', '#0a7ea4']} className="px-6 pt-12 pb-7 rounded-b-[32px]">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center mb-5 active:bg-white/25 border border-white/10">
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <ThemedText className="text-white text-2xl font-bold tracking-tight">Add Product</ThemedText>
        <ThemedText className="text-white/50 text-sm mt-1">Create a new inventory product</ThemedText>
      </LinearGradient>

      <View className="px-4 -mt-5 gap-3.5">
        <View className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700">
          {sectionHeader('cube-outline', 'Basic Info', 'Product name, SKU and description')}
          <View className="gap-3.5">
            <View>
              <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Product Name *</ThemedText>
              <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700" placeholder="Enter product name" placeholderTextColor="#9CA3AF" value={name} onChangeText={setName} />
            </View>
            <View className="flex-row gap-2.5">
              <View className="flex-1">
                <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">SKU</ThemedText>
                <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700" placeholder="Auto-generated" placeholderTextColor="#9CA3AF" value={sku} onChangeText={setSku} />
              </View>
              <View className="flex-1">
                <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Barcode</ThemedText>
                <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700" placeholder="Auto-generated" placeholderTextColor="#9CA3AF" value={barcode} onChangeText={setBarcode} />
              </View>
            </View>
            <View>
              <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Description</ThemedText>
              <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm min-h-[88px] border border-gray-200 dark:border-gray-700" placeholder="Optional product description" placeholderTextColor="#9CA3AF" multiline numberOfLines={3} textAlignVertical="top" value={description} onChangeText={setDescription} />
            </View>
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700">
          {sectionHeader('folder-outline', 'Category', 'Assign to a product category')}
          {categories.length > 0 ? (
            <Selector items={categories} selectedId={selectedCategory} placeholder="Select a category" onSelect={setSelectedCategory} />
          ) : (
            <TouchableOpacity onPress={() => router.push({ pathname: '/add-category' as any })} activeOpacity={0.7}>
              <View className="py-4 border-2 border-dashed border-primary/30 rounded-2xl items-center gap-2"><Ionicons name="folder-open-outline" size={24} color="#0a7ea4" /><ThemedText className="text-primary font-bold text-sm">Create Category</ThemedText></View>
            </TouchableOpacity>
          )}
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700">
          {sectionHeader('business-outline', 'Initial Stock & Invoice', 'Add initial quantity and attach purchase invoice')}
          {warehouses.length > 0 ? (
            <>
              <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Warehouse</ThemedText>
              <View className="mb-3.5">
                <Selector items={warehouses} selectedId={selectedWarehouse} placeholder="Select a warehouse" onSelect={setSelectedWarehouse} />
              </View>
              <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm mb-3.5 border border-gray-200 dark:border-gray-700" placeholder="Initial quantity (optional)" placeholderTextColor="#9CA3AF" keyboardType="decimal-pad" value={initialStock} onChangeText={setInitialStock} />
              <View className="border-t border-gray-100 dark:border-gray-700 pt-3.5">
                {invoiceImage ? (
                  <View className="gap-2.5">
                    <Image source={{ uri: invoiceImage }} className="w-full h-36 rounded-2xl bg-gray-100" resizeMode="cover" />
                    <View className="flex-row gap-2">
                      <TouchableOpacity onPress={() => pickInvoice(true)} className="flex-1 bg-gray-100 dark:bg-gray-700 py-2.5 rounded-2xl items-center flex-row justify-center gap-1.5 active:opacity-80"><Ionicons name="camera" size={14} color="#6B7280" /><ThemedText className="text-gray-600 dark:text-gray-400 text-[10px] font-bold">Re-take</ThemedText></TouchableOpacity>
                      <TouchableOpacity onPress={() => pickInvoice(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 py-2.5 rounded-2xl items-center flex-row justify-center gap-1.5 active:opacity-80"><Ionicons name="images" size={14} color="#6B7280" /><ThemedText className="text-gray-600 dark:text-gray-400 text-[10px] font-bold">Gallery</ThemedText></TouchableOpacity>
                    </View>
                    {uploadingInvoice && <View className="flex-row items-center gap-2 bg-primary/5 rounded-2xl px-4 py-2.5"><ActivityIndicator size="small" color="#0a7ea4" /><ThemedText className="text-primary text-[10px]">Uploading invoice...</ThemedText></View>}
                    {invoiceUrl && <View className="flex-row items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl px-4 py-2.5"><Ionicons name="checkmark-circle" size={14} color="#22c55e" /><ThemedText className="text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">Invoice uploaded</ThemedText></View>}
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => pickInvoice(true)} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 items-center border-2 border-dashed border-primary/30 active:opacity-80">
                    <Ionicons name="receipt-outline" size={28} color="#0a7ea4" /><ThemedText className="text-primary font-bold text-xs mt-2">Attach Invoice Photo</ThemedText><ThemedText className="text-gray-400 dark:text-gray-500 text-[10px] mt-0.5">For initial stock purchase</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <TouchableOpacity onPress={() => router.push({ pathname: '/add-warehouse' as any })} activeOpacity={0.7}>
              <View className="py-4 border-2 border-dashed border-primary/30 rounded-2xl items-center gap-2"><Ionicons name="business-outline" size={24} color="#0a7ea4" /><ThemedText className="text-primary font-bold text-sm">Create Warehouse</ThemedText><ThemedText className="text-gray-400 dark:text-gray-500 text-[10px]">You need a warehouse to track stock</ThemedText></View>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={handleSubmit} disabled={submitting} className="bg-gray-900 dark:bg-white rounded-2xl py-4 items-center justify-center mb-6 active:opacity-80">
          {submitting ? <ActivityIndicator color="#fff" /> : (
            <View className="flex-row items-center gap-2"><Ionicons name="checkmark-circle" size={20} color="#fff" /><ThemedText className="text-white dark:text-gray-900 font-bold text-base">Create Product</ThemedText></View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
