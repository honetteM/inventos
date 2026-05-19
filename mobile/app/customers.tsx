import { useState, useEffect, useCallback } from 'react';
import { ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as salesService from '@/src/services/sales';
import type { CustomerListItem } from '@/src/types/sales';

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await salesService.getCustomers({ search: search || undefined, per_page: 50 });
      setCustomers(res.data);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => { setLoading(true); fetchData(); }, [fetchData]);
  function onRefresh() { setRefreshing(true); fetchData(); }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />}>
      <LinearGradient colors={['#064e3b', '#059669', '#06b884']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.2 }} className="px-6 pt-12 pb-8 rounded-b-[32px]">
        <View className="flex-row items-center gap-4 mb-4">
          <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center">
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View className="flex-1">
            <ThemedText className="text-white/50 text-xs font-medium tracking-widest uppercase">Sales</ThemedText>
            <ThemedText className="text-white text-2xl font-bold">Customers</ThemedText>
          </View>
          <TouchableOpacity onPress={() => router.push({ pathname: '/add-customer' as any })} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center">
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center bg-white/10 rounded-2xl px-4 py-3 gap-2.5 border border-white/10">
          <Ionicons name="search-outline" size={18} color="#ffffffaa" />
          <TextInput className="flex-1 text-white text-sm" placeholder="Search customers..." placeholderTextColor="#ffffff77" value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="#ffffffaa" /></TouchableOpacity> : null}
        </View>
      </LinearGradient>

      <View className="-mt-4 px-4 gap-3">
        {loading ? (
          <View className="items-center py-16"><ActivityIndicator size="large" color="#059669" /></View>
        ) : customers.length === 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-10 items-center border border-gray-100 dark:border-gray-700">
            <View className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-3xl items-center justify-center mb-5"><Ionicons name="people-outline" size={36} color="#9CA3AF" /></View>
            <ThemedText className="text-gray-900 dark:text-white font-bold text-lg">No customers yet</ThemedText>
            <TouchableOpacity onPress={() => router.push({ pathname: '/add-customer' as any })} className="mt-6 bg-primary px-8 py-3.5 rounded-xl active:opacity-80">
              <ThemedText className="text-white font-bold text-sm">Add Customer</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          customers.map((c) => (
            <TouchableOpacity key={c.id} activeOpacity={0.7} onPress={() => router.push({ pathname: '/customer/[id]', params: { id: String(c.id) } })}>
              <View className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center">
                    <Ionicons name="person-outline" size={20} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="text-gray-900 dark:text-white text-sm font-bold">{c.name}</ThemedText>
                    <View className="flex-row items-center gap-2 mt-0.5">
                      {c.email && <ThemedText className="text-gray-400 dark:text-gray-500 text-xs">{c.email}</ThemedText>}
                      {c.phone && <> {c.email && <View className="w-0.5 h-0.5 rounded-full bg-gray-300" />} <ThemedText className="text-gray-400 dark:text-gray-500 text-xs">{c.phone}</ThemedText></>}
                    </View>
                    <View className="flex-row items-center justify-between mt-1.5">
                      <ThemedText className="text-green-600 font-bold text-sm">RWF {Number(c.total_purchases).toLocaleString()}</ThemedText>
                      <ThemedText className={`text-xs font-semibold ${c.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {c.balance > 0 ? `Due: ${Number(c.balance).toLocaleString()}` : 'Settled'}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}
