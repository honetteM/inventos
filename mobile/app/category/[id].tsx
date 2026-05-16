import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import * as inventoryService from '@/src/services/inventory';
import type { ProductListItem, Category } from '@/src/types/inventory';

export default function CategoryProductsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [prodRes, catRes] = await Promise.all([
        inventoryService.getProducts({ category_id: Number(id), per_page: 100 }),
        inventoryService.getCategory(Number(id)),
      ]);
      setProducts(prodRes.data);
      setCategory(catRes.data);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);
  function onRefresh() { setRefreshing(true); fetchData(); }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <LinearGradient colors={['#0a1f2e', '#0f4e6b', '#0a7ea4']} className="px-6 pt-12 pb-8 rounded-b-[32px]">
        <View className="flex-row items-center justify-between mb-5">
          <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center active:bg-white/25 border border-white/10">
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push({ pathname: '/add-product' as any })} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center active:bg-white/25 border border-white/10">
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <ThemedText className="text-white text-2xl font-bold tracking-tight">{category?.name ?? 'Category'}</ThemedText>
        <ThemedText className="text-white/50 text-sm mt-1">{products.length} product{products.length !== 1 ? 's' : ''}</ThemedText>
      </LinearGradient>

      {loading ? (
        <View className="flex-1 items-center justify-center py-20"><ActivityIndicator size="large" color="#0a7ea4" /></View>
      ) : (
        <ScrollView className="flex-1 px-4 -mt-5" contentContainerStyle={{ paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a7ea4" />}>
          {products.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-3xl p-10 items-center mt-3 border border-gray-100 dark:border-gray-700">
              <View className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-3xl items-center justify-center mb-5"><Ionicons name="cube-outline" size={36} color="#9CA3AF" /></View>
              <ThemedText className="text-gray-900 dark:text-white font-bold text-lg">No products</ThemedText>
              <ThemedText className="text-gray-400 dark:text-gray-500 text-sm mt-1.5 text-center">This category has no products yet.</ThemedText>
              <TouchableOpacity onPress={() => router.push({ pathname: '/add-product' as any })} className="mt-6 bg-primary px-8 py-3.5 rounded-xl active:opacity-80">
                <ThemedText className="text-white font-bold text-sm">Add Product</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="mt-3 gap-2.5">
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
        </ScrollView>
      )}
    </View>
  );
}
