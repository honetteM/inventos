import { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as inventoryService from '@/src/services/inventory';
import { uploadImage } from '@/src/services/cloudinary';
import type { Warehouse, Product } from '@/src/types/inventory';

const movementTypes = [
  { value: 'stock_in', label: 'Stock In', icon: 'arrow-down-outline' as const },
  { value: 'stock_out', label: 'Stock Out', icon: 'arrow-up-outline' as const },
  { value: 'adjustment_plus', label: 'Add Adjustment', icon: 'add-outline' as const },
  { value: 'adjustment_minus', label: 'Remove Adjustment', icon: 'remove-outline' as const },
  { value: 'return', label: 'Return', icon: 'return-up-back-outline' as const },
];

export default function StockMovementScreen() {
  const { product_id } = useLocalSearchParams<{ product_id: string }>();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedType, setSelectedType] = useState('stock_in');
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [invoiceImage, setInvoiceImage] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadWarehouses();
    if (product_id) loadProduct();
  }, []);

  async function loadWarehouses() {
    try {
      const res = await inventoryService.getWarehouses();
      setWarehouses(res.data);
      if (res.data.length > 0) {
        setSelectedWarehouse(res.data[0].id);
      }
    } catch {}
  }

  async function loadProduct() {
    try {
      const res = await inventoryService.getProduct(Number(product_id));
      setProduct(res.data);
    } catch {}
  }

  function handleTypeChange(type: string) {
    const isOut = ['stock_out', 'adjustment_minus'].includes(type);
    if (isOut && product && product.cost_price <= 0 && product.selling_price <= 0) {
      Alert.alert('Prices Required', 'Set cost and selling prices for this product before selling. Go to the product detail page to configure pricing.', [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        { text: 'Set Prices', onPress: () => router.push({ pathname: '/product/[id]', params: { id: product_id } }) },
      ]);
      return;
    }
    setSelectedType(type);
  }

  async function pickInvoice(fromCamera: boolean) {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', fromCamera ? 'Camera access is required' : 'Gallery access is required');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true });

    if (!result.canceled && result.assets[0]) {
      setInvoiceImage(result.assets[0].uri);
      setInvoiceUrl(null);
      setUploading(true);
      try {
        const url = await uploadImage(result.assets[0].uri);
        setInvoiceUrl(url);
      } catch (e: any) {
        Alert.alert('Upload failed', e.message);
      } finally {
        setUploading(false);
      }
    }
  }

  async function handleSubmit() {
    if (!selectedWarehouse) {
      Alert.alert('Error', 'Please select a warehouse');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }
    if (selectedType === 'stock_in' && !invoiceUrl) {
      Alert.alert('Invoice required', 'Please attach an invoice image for stock-in movements');
      return;
    }

    setSubmitting(true);
    try {
      await inventoryService.createStockMovement({
        product_id: Number(product_id),
        warehouse_id: selectedWarehouse,
        type: selectedType,
        quantity: Number(quantity),
        notes: notes || undefined,
        invoice_url: invoiceUrl || undefined,
      });
      Alert.alert('Success', 'Stock movement recorded', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to record movement');
    } finally {
      setSubmitting(false);
    }
  }

  const isOutType = ['stock_out', 'adjustment_minus'].includes(selectedType);

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      contentContainerStyle={{ paddingBottom: 100 }}
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient
        colors={['#0a1f2e', '#0f4e6b', '#0a7ea4']}
        className="px-6 pt-12 pb-6 rounded-b-[32px]"
      >
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mb-4">
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <ThemedText className="text-white text-2xl font-bold">Stock Movement</ThemedText>
        <ThemedText className="text-white/60 text-sm mt-1">Record inventory movement</ThemedText>
      </LinearGradient>

      <ThemedView className="px-4 -mt-5 gap-4">
        <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <ThemedText className="text-gray-900 dark:text-white font-bold text-sm mb-3">Movement Type</ThemedText>
          <ThemedView className="flex-row flex-wrap gap-2">
            {movementTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                onPress={() => handleTypeChange(type.value)}
                className={`px-3 py-2.5 rounded-xl flex-row items-center gap-1.5 ${
                  selectedType === type.value
                    ? 'bg-primary'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <Ionicons name={type.icon} size={16} color={selectedType === type.value ? '#fff' : '#6B7280'} />
                <ThemedText className={`text-xs font-bold ${selectedType === type.value ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                  {type.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <ThemedText className="text-gray-900 dark:text-white font-bold text-sm mb-3">Warehouse</ThemedText>
          <ThemedView className="flex-row flex-wrap gap-2">
            {warehouses.map((wh) => (
              <TouchableOpacity
                key={wh.id}
                onPress={() => setSelectedWarehouse(wh.id)}
                className={`px-4 py-2.5 rounded-xl ${
                  selectedWarehouse === wh.id
                    ? 'bg-primary'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <ThemedText className={`text-xs font-bold ${selectedWarehouse === wh.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                  {wh.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <ThemedText className="text-gray-900 dark:text-white font-bold text-sm mb-3">Quantity {isOutType ? '(removing)' : '(adding)'}</ThemedText>
          <TextInput
            className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-lg font-bold"
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            keyboardType="decimal-pad"
            value={quantity}
            onChangeText={setQuantity}
          />
        </ThemedView>

        <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <ThemedText className="text-gray-900 dark:text-white font-bold text-sm mb-3">Notes (optional)</ThemedText>
          <TextInput
            className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm"
            placeholder="Reference or notes..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
          />
        </ThemedView>

        {selectedType === 'stock_in' && (
          <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <ThemedView className="flex-row items-center gap-3 mb-4">
              <ThemedView className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <Ionicons name="receipt-outline" size={20} color="#0a7ea4" />
              </ThemedView>
              <ThemedView>
                <ThemedText className="text-gray-900 dark:text-white font-bold text-sm">Invoice</ThemedText>
                <ThemedText className="text-gray-400 dark:text-gray-500 text-[10px]">Attach invoice image for this stock-in</ThemedText>
              </ThemedView>
            </ThemedView>

            {invoiceImage ? (
              <ThemedView className="gap-3">
                <Image source={{ uri: invoiceImage }} className="w-full h-40 rounded-xl bg-gray-100" resizeMode="cover" />
                <ThemedView className="flex-row gap-2">
                  <TouchableOpacity onPress={() => pickInvoice(true)} className="flex-1 bg-gray-100 dark:bg-gray-700 py-2.5 rounded-xl items-center flex-row justify-center gap-1.5 active:opacity-80">
                    <Ionicons name="camera" size={14} color="#6B7280" />
                    <ThemedText className="text-gray-600 dark:text-gray-400 text-[10px] font-bold">Re-take</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => pickInvoice(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 py-2.5 rounded-xl items-center flex-row justify-center gap-1.5 active:opacity-80">
                    <Ionicons name="images" size={14} color="#6B7280" />
                    <ThemedText className="text-gray-600 dark:text-gray-400 text-[10px] font-bold">Gallery</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
                {uploading && (
                  <ThemedView className="flex-row items-center gap-2 bg-primary/5 rounded-xl px-4 py-2.5">
                    <ActivityIndicator size="small" color="#0a7ea4" />
                    <ThemedText className="text-primary text-[10px]">Uploading image...</ThemedText>
                  </ThemedView>
                )}
                {invoiceUrl && (
                  <ThemedView className="flex-row items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-2.5">
                    <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                    <ThemedText className="text-green-600 dark:text-green-400 text-[10px] font-medium">Invoice uploaded</ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
            ) : (
              <ThemedView className="gap-2">
                <TouchableOpacity onPress={() => pickInvoice(true)} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 items-center border-2 border-dashed border-primary/30 active:opacity-80">
                  <Ionicons name="camera-outline" size={32} color="#0a7ea4" />
                  <ThemedText className="text-primary font-bold text-sm mt-2">Take Invoice Photo</ThemedText>
                  <ThemedText className="text-gray-400 dark:text-gray-500 text-[10px] mt-1">Optional — attach invoice for this stock-in</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => pickInvoice(false)} className="py-2 items-center active:opacity-80">
                  <ThemedText className="text-primary text-[10px] font-medium">Or choose from gallery</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            )}
          </ThemedView>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className="bg-primary rounded-2xl py-4 items-center justify-center shadow-sm mb-4"
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedView className="flex-row items-center gap-2">
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <ThemedText className="text-white font-bold text-base">Record Movement</ThemedText>
            </ThemedView>
          )}
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}
