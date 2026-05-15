import { ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/src/context/auth-context';

const quickActions = [
  { icon: 'cube-outline' as const, label: 'Inventory', gradient: ['#0a7ea4', '#0f9cc9'] as const, route: '/(tabs)/inventory' },
  { icon: 'cart-outline' as const, label: 'Orders', gradient: ['#059669', '#06b884'] as const, route: '/(tabs)/orders' },
  { icon: 'people-outline' as const, label: 'Customers', gradient: ['#7c3aed', '#9b6df0'] as const, route: '/(tabs)/profile' },
  { icon: 'bar-chart-outline' as const, label: 'Reports', gradient: ['#d97706', '#f59e0b'] as const, route: '/(tabs)/profile' },
];

const stats = [
  { label: 'Products', value: '0', icon: 'layers-outline' as const, color: '#0a7ea4' },
  { label: 'Categories', value: '0', icon: 'folder-outline' as const, color: '#059669' },
  { label: 'Orders', value: '0', icon: 'cart-outline' as const, color: '#7c3aed' },
  { label: 'Sales', value: '0', icon: 'trending-up-outline' as const, color: '#d97706' },
];

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#0a1f2e', '#0f4e6b', '#0a7ea4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        className="px-6 pt-6 pb-12 rounded-b-[32px]"
      >
        <ThemedView className="flex-row items-center gap-5">
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            className="w-20 h-20 bg-white/15 rounded-full items-center justify-center border-[3px] border-white/30 active:bg-white/25"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 }}
          >
            <ThemedText className="text-white text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </ThemedText>
          </TouchableOpacity>
          <ThemedView className="flex-1 gap-1">
            <ThemedText className="text-white text-2xl font-bold">{user?.name ?? 'User'}</ThemedText>
            <ThemedView className="flex-row items-center gap-1.5">
              <Ionicons name="business-outline" size={14} color="#ffffffaa" />
              <ThemedText className="text-white/60 text-sm font-medium" numberOfLines={1}>
                {user?.tenant?.name ?? 'My Company'}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </LinearGradient>

      <ThemedView className="-mt-5 px-4">
        <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <ThemedView className="flex-row items-center justify-between mb-4">
            <ThemedText className="text-gray-900 dark:text-white font-bold text-base">Overview</ThemedText>
            <ThemedView className="flex-row items-center gap-1.5">
              <ThemedView className="w-2 h-2 rounded-full bg-green-500" />
              <ThemedText className="text-gray-400 dark:text-gray-500 text-xs">Active</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView className="flex-row flex-wrap gap-3">
            {stats.map((stat) => (
              <ThemedView key={stat.label} className="flex-1 min-w-[45%] flex-row items-center gap-3">
                <ThemedView className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                  <Ionicons name={stat.icon} size={18} color={stat.color} />
                </ThemedView>
                <ThemedView>
                  <ThemedText className="text-gray-900 dark:text-white text-xl font-bold">{stat.value}</ThemedText>
                  <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium">{stat.label}</ThemedText>
                </ThemedView>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView className="px-4 mt-7">
        <ThemedText className="text-gray-900 dark:text-white text-base font-bold mb-4">Quick Actions</ThemedText>
        <ThemedView className="flex-row flex-wrap gap-3">
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.8}
              className="flex-1 min-w-[47%]"
            >
              <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                <LinearGradient colors={action.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="p-4 items-center gap-2">
                  <ThemedView className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                    <Ionicons name={action.icon} size={24} color="#fff" />
                  </ThemedView>
                  <ThemedText className="text-white font-bold text-sm">{action.label}</ThemedText>
                </LinearGradient>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>

      {user?.roles && user.roles.length > 0 && (
        <ThemedView className="px-4 mt-7 mb-4">
          <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <ThemedView className="flex-row items-center gap-2 mb-4">
              <Ionicons name="shield-checkmark-outline" size={20} color="#0a7ea4" />
              <ThemedText className="text-gray-900 dark:text-white font-bold text-base">Access Control</ThemedText>
            </ThemedView>
            <ThemedView className="flex-row flex-wrap gap-2">
              {user.roles.map((role) => (
                <ThemedView key={role} className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 flex-row items-center gap-1.5">
                  <Ionicons name="checkmark-circle" size={14} color="#0a7ea4" />
                  <ThemedText className="text-primary text-sm font-bold capitalize">{role.replace('_', ' ')}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
            {user?.permissions && (
              <ThemedView className="flex-row items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <ThemedView className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <ThemedView className="w-full h-full bg-primary rounded-full" />
                </ThemedView>
                <ThemedText className="text-gray-500 dark:text-gray-400 text-xs font-medium">{user.permissions.length} permissions</ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      )}
    </ScrollView>
  );
}
