import { useState, useEffect, useCallback } from 'react';
import { ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, View, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as salesService from '@/src/services/sales';
import type { Quotation } from '@/src/types/sales';

export default function QuotationsScreen() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await salesService.getQuotations({ per_page: 50 });
      setQuotations(res.data);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  function onRefresh() { setRefreshing(true); fetchData(); }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />}>
      <LinearGradient colors={['#064e3b', '#059669', '#06b884']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.2 }} className="px-6 pt-12 pb-8 rounded-b-[32px]">
        <View className="flex-row items-center gap-4 mb-4">
          <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center">
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View>
            <ThemedText className="text-white/50 text-xs font-medium tracking-widest uppercase">Sales</ThemedText>
            <ThemedText className="text-white text-2xl font-bold">Quotations</ThemedText>
          </View>
        </View>
      </LinearGradient>

      <View className="-mt-4 px-4 gap-3">
        {loading ? (
          <View className="items-center py-16"><ActivityIndicator size="large" color="#059669" /></View>
        ) : quotations.length === 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-10 items-center border border-gray-100 dark:border-gray-700">
            <View className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-3xl items-center justify-center mb-5"><Ionicons name="document-text-outline" size={36} color="#9CA3AF" /></View>
            <ThemedText className="text-gray-900 dark:text-white font-bold text-lg">No quotations yet</ThemedText>
          </View>
        ) : (
          quotations.map((q) => (
            <TouchableOpacity key={q.id} activeOpacity={0.7}>
              <View className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center">
                    <Ionicons name="document-text-outline" size={20} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="text-gray-900 dark:text-white text-sm font-bold">{q.quotation_number}</ThemedText>
                    <ThemedText className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{q.customer?.name ?? 'No customer'}</ThemedText>
                    <ThemedText className="text-gray-900 dark:text-white font-bold text-sm mt-1">RWF {Number(q.total).toLocaleString()}</ThemedText>
                  </View>
                  <ThemedText className="text-gray-400 dark:text-gray-500 text-xs capitalize">{q.status}</ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}
