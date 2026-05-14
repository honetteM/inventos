import { ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/src/context/auth-context';

const quickActions = [
  { icon: 'cube-outline' as const, label: 'Inventory', color: '#0a7ea4', route: '/(tabs)/explore' },
  { icon: 'cart-outline' as const, label: 'Sales', color: '#059669', route: '/(tabs)/explore' },
  { icon: 'people-outline' as const, label: 'Customers', color: '#7c3aed', route: '/(tabs)/explore' },
  { icon: 'bar-chart-outline' as const, label: 'Reports', color: '#d97706', route: '/(tabs)/explore' },
];

const statsCards = [
  { label: 'Products', value: '0', icon: 'layers-outline' as const, color: '#0a7ea4' },
  { label: 'Categories', value: '0', icon: 'folder-outline' as const, color: '#059669' },
  { label: 'Warehouses', value: '0', icon: 'business-outline' as const, color: '#7c3aed' },
  { label: 'Sales', value: '0', icon: 'trending-up-outline' as const, color: '#d97706' },
];

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#0c374b', '#0a7ea4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-14 pb-8 rounded-b-3xl"
      >
        <ThemedView className="flex-row items-center justify-between">
          <ThemedView className="gap-1">
            <ThemedText className="text-white/60 text-sm font-medium">Welcome back,</ThemedText>
            <ThemedText className="text-white text-2xl font-bold">{user?.name ?? 'User'}</ThemedText>
          </ThemedView>
          <ThemedView className="w-12 h-12 bg-white/20 rounded-full items-center justify-center border border-white/30">
            <ThemedText className="text-white text-lg font-bold">
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView className="mt-6 bg-white/15 rounded-2xl p-4 border border-white/20">
          <ThemedView className="flex-row items-center gap-2 mb-1">
            <Ionicons name="business-outline" size={16} color="#ffffffcc" />
            <ThemedText className="text-white/70 text-sm">{user?.tenant?.name ?? 'My Company'}</ThemedText>
          </ThemedView>
          <ThemedText className="text-white/50 text-xs">Active since 2026</ThemedText>
        </ThemedView>
      </LinearGradient>

      <ThemedView className="-mt-6 mx-4">
        <ThemedView className="flex-row flex-wrap gap-3">
          {statsCards.map((stat) => (
            <ThemedView key={stat.label} className="flex-1 min-w-[45%] bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <ThemedView className="w-10 h-10 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}15` }}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
              </ThemedView>
              <ThemedText className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</ThemedText>
              <ThemedText className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{stat.label}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>

      <ThemedView className="px-4 mt-6">
        <ThemedText className="text-lg font-bold text-gray-900 dark:text-white mb-3">Quick Actions</ThemedText>
        <ThemedView className="flex-row flex-wrap gap-3">
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.7}
              className="flex-1 min-w-[45%]"
            >
              <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 items-center gap-2">
                <ThemedView className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: `${action.color}15` }}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </ThemedView>
                <ThemedText className="text-gray-900 dark:text-white font-semibold text-sm">{action.label}</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>

      {user?.roles && user.roles.length > 0 && (
        <ThemedView className="px-4 mt-6 mb-8">
          <ThemedText className="text-lg font-bold text-gray-900 dark:text-white mb-3">Roles & Permissions</ThemedText>
          <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <ThemedView className="flex-row flex-wrap gap-2">
              {user.roles.map((role) => (
                <ThemedView key={role} className="bg-primary/10 px-4 py-2 rounded-xl">
                  <ThemedText className="text-primary text-sm font-semibold capitalize">{role}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
            {user?.permissions && (
              <ThemedText className="text-gray-500 dark:text-gray-400 text-sm mt-3">
                {user.permissions.length} permission{user.permissions.length !== 1 ? 's' : ''} assigned
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>
      )}
    </ScrollView>
  );
}
