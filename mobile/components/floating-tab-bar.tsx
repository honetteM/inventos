import { TouchableOpacity, View } from 'react-native';
import { useSegments, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';

const tabs = [
  { id: 'home', segment: 'index', label: 'Home', icon: 'home-outline' as const, activeIcon: 'home' as const },
  { id: 'inventory', segment: 'inventory', label: 'Inventory', icon: 'cube-outline' as const, activeIcon: 'cube' as const },
  { id: 'sales', segment: 'sales', label: 'Sales', icon: 'cart-outline' as const, activeIcon: 'cart' as const },
  { id: 'orders', segment: 'orders', label: 'Orders', icon: 'receipt-outline' as const, activeIcon: 'receipt' as const },
  { id: 'profile', segment: 'profile', label: 'Profile', icon: 'person-outline' as const, activeIcon: 'person' as const },
];

export function FloatingTabBar() {
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const currentSegment = segments[1] ?? 'index';

  function isActive(segment: string) {
    return currentSegment === segment;
  }

  function handlePress(segment: string) {
    const path = segment === 'index' ? '/(tabs)' : `/(tabs)/${segment}`;
    router.push(path as any);
  }

  return (
    <View
      className="absolute bottom-0 left-0 right-0 items-center"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <View
        className="flex-row bg-white/95 dark:bg-gray-800/95 mx-5 rounded-2xl px-3 py-2"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.segment);
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handlePress(tab.segment)}
              activeOpacity={0.6}
              className="flex-1 items-center justify-center py-1.5 rounded-xl relative"
            >
              {active && (
                <View className="absolute inset-0 bg-primary/10 rounded-xl" />
              )}
              <Ionicons
                name={active ? tab.activeIcon : tab.icon}
                size={20}
                color={active ? '#0a7ea4' : '#9CA3AF'}
              />
              <ThemedText
                className={`text-[9px] font-semibold mt-1 ${
                  active ? 'text-primary' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {tab.label}
              </ThemedText>
              {active && <View className="w-1 h-1 rounded-full bg-primary mt-1" />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
