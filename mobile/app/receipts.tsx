import { useState, useEffect, useCallback } from 'react';
import { ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import * as salesService from '@/src/services/sales';
import type { Receipt } from '@/src/types/sales';

export default function ReceiptsScreen() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await salesService.getReceipts({ search: search || undefined, per_page: 50 });
      setReceipts(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load receipts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => { setLoading(true); fetchData(); }, [fetchData]);
  function onRefresh() { setRefreshing(true); fetchData(); }

  const totalAmount = receipts.reduce((sum, r) => sum + Number(r.amount), 0);

  function paymentBadge(method: string): string {
    switch (method) {
      case 'cash': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'mobile_money': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'bank': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'card': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'cheque': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    }
  }

  function formatMethod(method: string): string {
    return method.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

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
            <ThemedText className="text-white text-2xl font-bold">Receipts</ThemedText>
          </View>
        </View>
        <View className="flex-row items-center bg-white/10 rounded-2xl px-4 py-3 gap-2.5 border border-white/10">
          <Ionicons name="search-outline" size={18} color="#ffffffaa" />
          <TextInput className="flex-1 text-white text-sm" placeholder="Search receipts..." placeholderTextColor="#ffffff77" value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="#ffffffaa" /></TouchableOpacity> : null}
        </View>
      </LinearGradient>

      <View className="-mt-4 px-4 gap-3">
        {receipts.length > 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-gray-700 flex-row items-center justify-between">
            <ThemedText className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Receipts</ThemedText>
            <ThemedText className="text-green-600 font-bold text-base">{receipts.length} receipts</ThemedText>
          </View>
        )}

        {loading ? (
          <View className="items-center py-16"><ActivityIndicator size="large" color="#059669" /></View>
        ) : error ? (
          <View className="bg-red-50 dark:bg-red-900/20 rounded-3xl p-8 items-center border border-red-100 dark:border-red-900/30">
            <View className="w-14 h-14 bg-red-100 dark:bg-red-900/40 rounded-2xl items-center justify-center mb-4"><Ionicons name="cloud-offline-outline" size={28} color="#ef4444" /></View>
            <ThemedText className="text-red-600 dark:text-red-400 text-sm font-semibold text-center">{error}</ThemedText>
            <TouchableOpacity onPress={onRefresh} className="mt-5 bg-red-500 px-6 py-3 rounded-xl active:opacity-80"><ThemedText className="text-white text-xs font-bold">Retry</ThemedText></TouchableOpacity>
          </View>
        ) : receipts.length === 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-10 items-center border border-gray-100 dark:border-gray-700">
            <View className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-3xl items-center justify-center mb-5"><Ionicons name="receipt-outline" size={36} color="#9CA3AF" /></View>
            <ThemedText className="text-gray-900 dark:text-white font-bold text-lg">No receipts yet</ThemedText>
            <ThemedText className="text-gray-400 dark:text-gray-500 text-sm mt-1.5 text-center leading-5">Receipts are automatically created when an invoice payment is recorded.</ThemedText>
          </View>
        ) : (
          <View className="gap-2.5">
            {receipts.map((r) => (
              <TouchableOpacity key={r.id} activeOpacity={0.7} onPress={() => {
                if (r.invoice_id) {
                  router.push({ pathname: '/invoice/[id]', params: { id: String(r.invoice_id) } });
                }
              }}>
                <View className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-gray-700">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center">
                      <Ionicons name="receipt-outline" size={20} color="#059669" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <ThemedText className="text-gray-900 dark:text-white text-sm font-bold">{r.receipt_number}</ThemedText>
                        <View className={`px-2 py-0.5 rounded-full ${paymentBadge(r.payment_method)}`}>
                          <ThemedText className="text-[10px] font-semibold">{formatMethod(r.payment_method)}</ThemedText>
                        </View>
                      </View>
                      {r.customer?.name && (
                        <ThemedText className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{r.customer.name}</ThemedText>
                      )}
                      <View className="flex-row items-center justify-between mt-1.5">
                        <ThemedText className="text-green-600 font-bold text-sm">RWF {Number(r.amount).toLocaleString()}</ThemedText>
                        <ThemedText className="text-gray-400 dark:text-gray-500 text-[10px]">{r.receipt_date}</ThemedText>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
