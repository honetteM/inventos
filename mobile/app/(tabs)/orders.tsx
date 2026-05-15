import { ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const stats = [
  { label: 'Total Orders', value: '0', icon: 'receipt-outline' as const, color: '#0a7ea4', bg: '#eefbff' },
  { label: 'Pending', value: '0', icon: 'time-outline' as const, color: '#d97706', bg: '#fffbeb' },
  { label: 'Completed', value: '0', icon: 'checkmark-circle-outline' as const, color: '#059669', bg: '#ecfdf5' },
  { label: 'Cancelled', value: '0', icon: 'close-circle-outline' as const, color: '#dc2626', bg: '#fef2f2' },
];

const recentOrders = [
  { id: '#ORD-001', customer: 'Customer Name', status: 'Pending', total: '0.00', date: '--/--/----' },
  { id: '#ORD-002', customer: 'Customer Name', status: 'Pending', total: '0.00', date: '--/--/----' },
  { id: '#ORD-003', customer: 'Customer Name', status: 'Pending', total: '0.00', date: '--/--/----' },
];

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  Completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

export default function OrdersScreen() {
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
            <ThemedText className="text-white/60 text-sm font-medium">Sales & Orders</ThemedText>
            <ThemedText className="text-white text-2xl font-bold">Orders</ThemedText>
          </ThemedView>
          <ThemedView className="w-12 h-12 bg-white/20 rounded-full items-center justify-center border-2 border-white/30">
            <Ionicons name="cart" size={22} color="#fff" />
          </ThemedView>
        </ThemedView>
      </LinearGradient>

      <ThemedView className="-mt-5 px-4 gap-3">
        <ThemedView className="flex-row flex-wrap gap-3">
          {stats.map((stat) => (
            <TouchableOpacity key={stat.label} activeOpacity={0.7} className="w-[48%] flex-grow">
              <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center gap-3">
                <ThemedView className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: stat.bg }}>
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                </ThemedView>
                <ThemedView>
                  <ThemedText className="text-gray-900 dark:text-white text-lg font-bold">{stat.value}</ThemedText>
                  <ThemedText className="text-gray-500 dark:text-gray-400 text-xs">{stat.label}</ThemedText>
                </ThemedView>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>

        <ThemedView className="flex-row items-center justify-between mt-2">
          <ThemedText className="text-gray-900 dark:text-white text-lg font-bold">Recent Orders</ThemedText>
          <TouchableOpacity activeOpacity={0.7}>
            <ThemedText className="text-primary text-sm font-semibold">View All</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {recentOrders.map((order) => (
          <TouchableOpacity key={order.id} activeOpacity={0.7}>
            <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center gap-4">
              <ThemedView className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl items-center justify-center">
                <Ionicons name="receipt-outline" size={24} color="#9CA3AF" />
              </ThemedView>
              <ThemedView className="flex-1">
                <ThemedView className="flex-row items-center gap-2">
                  <ThemedText className="text-gray-900 dark:text-white font-semibold">{order.id}</ThemedText>
                  <ThemedView className={`px-2 py-0.5 rounded-full ${statusColors[order.status]?.split(' ')[0] ?? 'bg-gray-100'}`}>
                    <ThemedText className={`text-[10px] font-bold ${statusColors[order.status]?.split(' ').slice(2).join(' ') ?? 'text-gray-500'}`}>
                      {order.status}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedText className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{order.customer}</ThemedText>
                <ThemedView className="flex-row items-center gap-1 mt-0.5">
                  <Ionicons name="calendar-outline" size={10} color="#9CA3AF" />
                  <ThemedText className="text-gray-400 dark:text-gray-500 text-[10px]">{order.date}</ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedText className="text-gray-900 dark:text-white font-bold">${order.total}</ThemedText>
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ScrollView>
  );
}
