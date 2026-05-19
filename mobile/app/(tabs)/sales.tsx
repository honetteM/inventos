import { useState, useEffect, useCallback } from 'react';
import { ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as salesService from '@/src/services/sales';
import type { InvoiceListItem } from '@/src/types/sales';

export default function SalesScreen() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await salesService.getInvoices({ search: search || undefined, per_page: 50 });
      setInvoices(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load invoices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => { setLoading(true); fetchData(); }, [fetchData]);
  function onRefresh() { setRefreshing(true); fetchData(); }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a7ea4" />}>
      <LinearGradient colors={['#064e3b', '#059669', '#06b884']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.2 }} className="px-6 pt-3 pb-8 rounded-b-[32px]">
        <View className="flex-row items-center justify-between mb-4">
          <View className="gap-0.5">
            <ThemedText className="text-white/50 text-xs font-medium tracking-widest uppercase">Sales</ThemedText>
            <ThemedText className="text-white text-2xl font-bold tracking-tight">Invoices</ThemedText>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={() => router.push({ pathname: '/add-invoice' as any })} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center active:bg-white/25 border border-white/10">
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row items-center bg-white/10 rounded-2xl px-4 py-3 gap-2.5 border border-white/10">
          <Ionicons name="search-outline" size={18} color="#ffffffaa" />
          <TextInput className="flex-1 text-white text-sm" placeholder="Search invoices..." placeholderTextColor="#ffffff77" value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="#ffffffaa" /></TouchableOpacity> : null}
        </View>
      </LinearGradient>

      <View className="-mt-4 px-4 gap-3">
        <View className="flex-row gap-2.5">
          <TouchableOpacity onPress={() => router.push({ pathname: '/quotations' as any })} className="flex-1 bg-white dark:bg-gray-800 rounded-2xl py-3 px-4 border border-gray-100 dark:border-gray-700 flex-row items-center justify-center gap-2 active:opacity-80">
            <View className="w-7 h-7 rounded-xl bg-green-100 items-center justify-center"><Ionicons name="document-text-outline" size={15} color="#059669" /></View>
            <ThemedText className="text-gray-700 dark:text-gray-300 text-xs font-semibold">Quotations</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push({ pathname: '/receipts' as any })} className="flex-1 bg-white dark:bg-gray-800 rounded-2xl py-3 px-4 border border-gray-100 dark:border-gray-700 flex-row items-center justify-center gap-2 active:opacity-80">
            <View className="w-7 h-7 rounded-xl bg-green-100 items-center justify-center"><Ionicons name="receipt-outline" size={15} color="#059669" /></View>
            <ThemedText className="text-gray-700 dark:text-gray-300 text-xs font-semibold">Receipts</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push({ pathname: '/customers' as any })} className="flex-1 bg-white dark:bg-gray-800 rounded-2xl py-3 px-4 border border-gray-100 dark:border-gray-700 flex-row items-center justify-center gap-2 active:opacity-80">
            <View className="w-7 h-7 rounded-xl bg-green-100 items-center justify-center"><Ionicons name="people-outline" size={15} color="#059669" /></View>
            <ThemedText className="text-gray-700 dark:text-gray-300 text-xs font-semibold">Customers</ThemedText>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="items-center py-16"><ActivityIndicator size="large" color="#059669" /></View>
        ) : error ? (
          <View className="bg-red-50 dark:bg-red-900/20 rounded-3xl p-8 items-center border border-red-100 dark:border-red-900/30">
            <View className="w-14 h-14 bg-red-100 dark:bg-red-900/40 rounded-2xl items-center justify-center mb-4"><Ionicons name="cloud-offline-outline" size={28} color="#ef4444" /></View>
            <ThemedText className="text-red-600 dark:text-red-400 text-sm font-semibold text-center">{error}</ThemedText>
            <TouchableOpacity onPress={onRefresh} className="mt-5 bg-red-500 px-6 py-3 rounded-xl active:opacity-80"><ThemedText className="text-white text-xs font-bold">Retry</ThemedText></TouchableOpacity>
          </View>
        ) : invoices.length === 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-10 items-center border border-gray-100 dark:border-gray-700">
            <View className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-3xl items-center justify-center mb-5"><Ionicons name="cart-outline" size={36} color="#9CA3AF" /></View>
            <ThemedText className="text-gray-900 dark:text-white font-bold text-lg">No invoices yet</ThemedText>
            <ThemedText className="text-gray-400 dark:text-gray-500 text-sm mt-1.5 text-center leading-5">Create your first invoice to start tracking sales.</ThemedText>
            <TouchableOpacity onPress={() => router.push({ pathname: '/add-invoice' as any })} className="mt-6 bg-primary px-8 py-3.5 rounded-xl active:opacity-80">
              <ThemedText className="text-white font-bold text-sm">Create Invoice</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-2.5">
            {invoices.map((inv) => (
              <TouchableOpacity key={inv.id} activeOpacity={0.7} onPress={() => router.push({ pathname: '/invoice/[id]', params: { id: String(inv.id) } })}>
                <View className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-gray-700">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center">
                      <Ionicons name="receipt-outline" size={20} color="#059669" />
                    </View>
                    <View className="flex-1 min-w-0">
                      <View className="flex-row items-center justify-between">
                        <ThemedText className="text-gray-900 dark:text-white text-sm font-bold flex-1 mr-2" numberOfLines={1}>{inv.invoice_number}</ThemedText>
                        <View className={`px-2 py-0.5 rounded-full ${statusBadge(inv.status)}`}>
                          <ThemedText className="text-[10px] font-bold capitalize">{inv.status}</ThemedText>
                        </View>
                      </View>
                      {inv.customer_name && <ThemedText className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{inv.customer_name}</ThemedText>}
                      <View className="flex-row items-center justify-between mt-1.5">
                        <ThemedText className="text-gray-900 dark:text-white font-bold text-sm">
                          {inv.currency ?? 'RWF'} {Number(inv.total).toLocaleString()}
                        </ThemedText>
                        <ThemedText className="text-gray-400 dark:text-gray-500 text-[10px]">
                          Due: {inv.balance_due > 0 ? `${Number(inv.balance_due).toLocaleString()}` : 'Paid'}
                        </ThemedText>
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

function statusBadge(status: string): string {
  switch (status) {
    case 'draft': return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    case 'confirmed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    case 'partial': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    case 'paid': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
  }
}
