import { ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const categories = [
  { label: 'All Products', count: '0', icon: 'cube-outline' as const, color: '#0a7ea4', bg: '#eefbff' },
  { label: 'Low Stock', count: '0', icon: 'alert-circle-outline' as const, color: '#dc2626', bg: '#fef2f2' },
  { label: 'Categories', count: '0', icon: 'folder-outline' as const, color: '#059669', bg: '#ecfdf5' },
  { label: 'Warehouses', count: '0', icon: 'business-outline' as const, color: '#7c3aed', bg: '#f5f3ff' },
];

const recentProducts = [
  { name: 'Sample Product 1', sku: 'SKU-001', stock: 0, price: '0.00' },
  { name: 'Sample Product 2', sku: 'SKU-002', stock: 0, price: '0.00' },
  { name: 'Sample Product 3', sku: 'SKU-003', stock: 0, price: '0.00' },
];

export default function InventoryScreen() {
  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#0c374b', '#0f6587', '#0a7ea4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-3 pb-8 rounded-b-3xl"
      >
        <ThemedView className="flex-row items-center justify-between">
          <ThemedView className="gap-1">
            <ThemedText className="text-white/60 text-sm font-medium">Manage Stock</ThemedText>
            <ThemedText className="text-white text-2xl font-bold">Inventory</ThemedText>
          </ThemedView>
          <ThemedView className="w-12 h-12 bg-white/20 rounded-full items-center justify-center border-2 border-white/30">
            <Ionicons name="cube" size={22} color="#fff" />
          </ThemedView>
        </ThemedView>
      </LinearGradient>

      <ThemedView className="-mt-5 px-4 gap-3">
        <ThemedView className="flex-row flex-wrap gap-3">
          {categories.map((cat) => (
            <TouchableOpacity key={cat.label} activeOpacity={0.7} className="w-[48%] flex-grow">
              <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center gap-3">
                <ThemedView className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: cat.bg }}>
                  <Ionicons name={cat.icon} size={24} color={cat.color} />
                </ThemedView>
                <ThemedView>
                  <ThemedText className="text-gray-900 dark:text-white text-lg font-bold">{cat.count}</ThemedText>
                  <ThemedText className="text-gray-500 dark:text-gray-400 text-xs">{cat.label}</ThemedText>
                </ThemedView>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>

        <ThemedView className="flex-row items-center justify-between mt-2">
          <ThemedText className="text-gray-900 dark:text-white text-lg font-bold">Recent Products</ThemedText>
          <TouchableOpacity activeOpacity={0.7}>
            <ThemedText className="text-primary text-sm font-semibold">View All</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {recentProducts.map((product) => (
          <TouchableOpacity key={product.sku} activeOpacity={0.7}>
            <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center gap-4">
              <ThemedView className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl items-center justify-center">
                <Ionicons name="cube-outline" size={24} color="#9CA3AF" />
              </ThemedView>
              <ThemedView className="flex-1">
                <ThemedText className="text-gray-900 dark:text-white font-semibold">{product.name}</ThemedText>
                <ThemedText className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{product.sku}</ThemedText>
              </ThemedView>
              <ThemedView className="items-end">
                <ThemedText className="text-gray-900 dark:text-white font-bold">${product.price}</ThemedText>
                <ThemedText className={`text-xs font-medium mt-0.5 ${product.stock === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  Stock: {product.stock}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ScrollView>
  );
}
