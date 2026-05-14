import { ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/src/context/auth-context';

const modules = [
  {
    icon: 'cube-outline' as const,
    title: 'Inventory Management',
    description: 'Track stock levels, manage products, and organize categories.',
    color: '#0a7ea4',
    bgColor: '#0a7ea415',
    status: 'Coming Soon',
  },
  {
    icon: 'cart-outline' as const,
    title: 'Sales & Invoicing',
    description: 'Create invoices, manage sales orders, and track payments.',
    color: '#059669',
    bgColor: '#05966915',
    status: 'Coming Soon',
  },
  {
    icon: 'people-outline' as const,
    title: 'Customer Management',
    description: 'Manage suppliers and customer relationships.',
    color: '#7c3aed',
    bgColor: '#7c3aed15',
    status: 'Coming Soon',
  },
  {
    icon: 'bar-chart-outline' as const,
    title: 'Reports & Analytics',
    description: 'View insights, sales reports, and inventory analytics.',
    color: '#d97706',
    bgColor: '#d9770615',
    status: 'Coming Soon',
  },
  {
    icon: 'wallet-outline' as const,
    title: 'Expense Tracking',
    description: 'Track expenses, manage accounts, and view journal entries.',
    color: '#dc2626',
    bgColor: '#dc262615',
    status: 'Coming Soon',
  },
  {
    icon: 'storefront-outline' as const,
    title: 'Warehouse Management',
    description: 'Manage multiple warehouses and stock transfers.',
    color: '#0891b2',
    bgColor: '#0891b215',
    status: 'Coming Soon',
  },
];

export default function ExploreScreen() {
  const { user } = useAuth();

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#0c374b', '#0a7ea4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-14 pb-8 rounded-b-3xl"
      >
        <ThemedText className="text-white text-2xl font-bold">Explore</ThemedText>
        <ThemedText className="text-white/70 text-base mt-1">
          All the tools you need to manage your business
        </ThemedText>
      </LinearGradient>

      <ThemedView className="px-4 -mt-5 gap-3 mb-8">
        {user?.permissions && (
          <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center gap-3">
            <ThemedView className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center">
              <Ionicons name="shield-checkmark-outline" size={20} color="#0a7ea4" />
            </ThemedView>
            <ThemedView className="flex-1">
              <ThemedText className="text-gray-900 dark:text-white font-semibold text-sm">
                {user.permissions.length} Permissions
              </ThemedText>
              <ThemedText className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                You have full access to all features
              </ThemedText>
            </ThemedView>
            <ThemedView className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
              <ThemedText className="text-green-700 dark:text-green-400 text-xs font-semibold">Active</ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        {modules.map((mod) => (
          <TouchableOpacity key={mod.title} activeOpacity={0.7}>
            <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center gap-4">
              <ThemedView className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: mod.bgColor }}>
                <Ionicons name={mod.icon} size={28} color={mod.color} />
              </ThemedView>
              <ThemedView className="flex-1">
                <ThemedView className="flex-row items-center gap-2">
                  <ThemedText className="text-gray-900 dark:text-white font-bold text-base flex-1">
                    {mod.title}
                  </ThemedText>
                </ThemedView>
                <ThemedText className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 leading-5">
                  {mod.description}
                </ThemedText>
                <ThemedView className="bg-gray-100 dark:bg-gray-700 self-start px-2.5 py-0.5 rounded-full mt-2">
                  <ThemedText className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                    {mod.status}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ScrollView>
  );
}
