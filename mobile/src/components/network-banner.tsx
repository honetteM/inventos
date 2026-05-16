import { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '@/src/services/network';
import { getPendingCount, onSyncEvent } from '@/src/services/sync';

export default function NetworkBanner() {
  const network = useNetwork();
  const [pendingCount, setPendingCount] = useState(0);
  const [slideAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const unsubscribe = onSyncEvent((event) => {
      if (event.pendingCount !== undefined) {
        setPendingCount(event.pendingCount);
      }
      if (event.type === 'sync_complete') {
        getPendingCount().then(setPendingCount).catch(() => {});
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: network.status === 'offline' ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (network.status === 'online' && pendingCount === 0) {
      getPendingCount().then(setPendingCount).catch(() => {});
    }
  }, [network.status]);

  if (network.status === 'online' && pendingCount === 0) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  return (
    <Animated.View
      style={{ transform: [{ translateY }] }}
      className="absolute top-0 left-0 right-0 z-50"
    >
      {network.status === 'offline' ? (
        <View className="bg-red-500 flex-row items-center justify-center py-2 px-4">
          <Ionicons name="cloud-offline-outline" size={16} color="white" />
          <Text className="text-white text-sm font-medium ml-2">
            You are offline
          </Text>
          {pendingCount > 0 && (
            <Text className="text-white text-sm ml-2">
              ({pendingCount} pending)
            </Text>
          )}
        </View>
      ) : pendingCount > 0 ? (
        <View className="bg-amber-500 flex-row items-center justify-center py-2 px-4">
          <Ionicons name="sync-outline" size={16} color="white" />
          <Text className="text-white text-sm font-medium ml-2">
            Syncing {pendingCount} pending {pendingCount === 1 ? 'change' : 'changes'}...
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}
