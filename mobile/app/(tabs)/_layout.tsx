import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { FloatingTabBar } from '@/components/floating-tab-bar';

export default function TabLayout() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1">
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="inventory" />
          <Tabs.Screen name="orders" />
          <Tabs.Screen name="profile" />
        </Tabs>
      </View>
      <FloatingTabBar />
    </SafeAreaView>
  );
}
