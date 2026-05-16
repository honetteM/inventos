import { useState, useEffect, useCallback } from 'react';
import { ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import * as inventoryService from '@/src/services/inventory';
import type { ProductListItem } from '@/src/types/inventory';

export default function InventoryScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const productsRes = await inventoryService.getProducts({ search: search || undefined, per_page: 50 });
      setProducts(productsRes.data);
    } catch (e: any) {
      const status = e?.response?.status;
      setError(status === 500 ? 'Server error. Ensure backend migrations are up to date.' : e?.response?.data?.message ?? e?.message ?? 'Failed to load inventory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => { setLoading(true); fetchData(); }, [fetchData]);
  function onRefresh() { setRefreshing(true); fetchData(); }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a7ea4" />}>

      <LinearGradient colors={['#0a1f2e', '#0f4e6b', '#0a7ea4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.2 }} className="px-6 pt-3 pb-8 rounded-b-[32px]">
        <View className="flex-row items-center justify-between mb-4">
          <View className="gap-0.5">
            <ThemedText className="text-white/50 text-xs font-medium tracking-widest uppercase">Manage Stock</ThemedText>
            <ThemedText className="text-white text-2xl font-bold tracking-tight">Inventory</ThemedText>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={() => router.push({ pathname: '/scan-barcode' as any })} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center active:bg-white/25 border border-white/10">
              <Ionicons name="barcode-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push({ pathname: '/add-product' as any })} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center active:bg-white/25 border border-white/10">
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row items-center bg-white/10 rounded-2xl px-4 py-3 gap-2.5 border border-white/10">
          <Ionicons name="search-outline" size={18} color="#ffffffaa" />
          <TextInput className="flex-1 text-white text-sm" placeholder="Search products, SKU, barcode..." placeholderTextColor="#ffffff77" value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="#ffffffaa" /></TouchableOpacity> : null}
        </View>
      </LinearGradient>

      <View className="-mt-4 px-4 gap-3">
        <View className="flex-row gap-2.5">
          <TouchableOpacity onPress={() => router.push({ pathname: '/categories' as any })} className="flex-1 bg-white dark:bg-gray-800 rounded-2xl py-3 px-4 border border-gray-100 dark:border-gray-700 flex-row items-center justify-center gap-2 active:opacity-80">
            <View className="w-7 h-7 rounded-xl bg-primary/10 items-center justify-center"><Ionicons name="folder-open-outline" size={15} color="#0a7ea4" /></View>
            <ThemedText className="text-gray-700 dark:text-gray-300 text-xs font-semibold">Category</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push({ pathname: '/warehouses' as any })} className="flex-1 bg-white dark:bg-gray-800 rounded-2xl py-3 px-4 border border-gray-100 dark:border-gray-700 flex-row items-center justify-center gap-2 active:opacity-80">
            <View className="w-7 h-7 rounded-xl bg-primary/10 items-center justify-center"><Ionicons name="business-outline" size={15} color="#0a7ea4" /></View>
            <ThemedText className="text-gray-700 dark:text-gray-300 text-xs font-semibold">Warehouse</ThemedText>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="items-center py-16"><ActivityIndicator size="large" color="#0a7ea4" /></View>
        ) : error ? (
          <View className="bg-red-50 dark:bg-red-900/20 rounded-3xl p-8 items-center border border-red-100 dark:border-red-900/30">
            <View className="w-14 h-14 bg-red-100 dark:bg-red-900/40 rounded-2xl items-center justify-center mb-4"><Ionicons name="cloud-offline-outline" size={28} color="#ef4444" /></View>
            <ThemedText className="text-red-600 dark:text-red-400 text-sm font-semibold text-center">{error}</ThemedText>
            <TouchableOpacity onPress={onRefresh} className="mt-5 bg-red-500 px-6 py-3 rounded-xl active:opacity-80"><ThemedText className="text-white text-xs font-bold">Retry</ThemedText></TouchableOpacity>
          </View>
        ) : products.length === 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-10 items-center border border-gray-100 dark:border-gray-700">
            <View className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-3xl items-center justify-center mb-5"><Ionicons name="cube-outline" size={36} color="#9CA3AF" /></View>
            <ThemedText className="text-gray-900 dark:text-white font-bold text-lg">No products yet</ThemedText>
            <ThemedText className="text-gray-400 dark:text-gray-500 text-sm mt-1.5 text-center leading-5">Add your first product to start managing inventory.</ThemedText>
            <TouchableOpacity onPress={() => router.push({ pathname: '/add-product' as any })} className="mt-6 bg-primary px-8 py-3.5 rounded-xl active:opacity-80">
              <ThemedText className="text-white font-bold text-sm">Add Product</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-2.5">
            {products.map((product) => {
              const outOfStock = product.total_stock <= 0;
              const lowStock = product.total_stock > 0 && product.total_stock < 10;
              const stockColor = outOfStock ? '#ef4444' : lowStock ? '#f59e0b' : '#22c55e';
              return (
                <TouchableOpacity key={product.id} activeOpacity={0.7} onPress={() => router.push({ pathname: '/product/[id]', params: { id: String(product.id) } })}>
                  <View className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-gray-700">
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center border border-primary/5">
                        <Ionicons name="cube-outline" size={20} color="#0a7ea4" />
                      </View>
                      <View className="flex-1 min-w-0">
                        <View className="flex-row items-center justify-between">
                          <ThemedText className="text-gray-900 dark:text-white text-sm font-bold flex-1 mr-2" numberOfLines={1}>{product.name}</ThemedText>
                          <View className="flex-row items-center gap-1.5">
                            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: stockColor }} />
                            <ThemedText className="text-xs font-semibold" style={{ color: stockColor }}>{product.total_stock}</ThemedText>
                          </View>
                        </View>
                        <View className="flex-row items-center gap-2 mt-0.5">
                          {product.sku && <ThemedText className="text-gray-400 dark:text-gray-500 text-xs">{product.sku}</ThemedText>}
                          {product.sku && product.category_name && <View className="w-0.5 h-0.5 rounded-full bg-gray-300 dark:bg-gray-600" />}
                          {product.category_name && <ThemedText className="text-gray-400 dark:text-gray-500 text-xs">{product.category_name}</ThemedText>}
                        </View>
                        <View className="flex-row items-center justify-between mt-1.5">
                          <ThemedText className="text-gray-900 dark:text-white font-bold text-sm">${product.selling_price.toFixed(2)}</ThemedText>
                          <ThemedText className="text-gray-400 dark:text-gray-500 text-[10px]">
                            {outOfStock ? 'Out of stock' : lowStock ? 'Low stock' : 'In stock'}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
