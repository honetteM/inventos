import { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as salesService from '@/src/services/sales';
import type { Customer } from '@/src/types/sales';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  async function loadCustomer() {
    try {
      const res = await salesService.getCustomer(Number(id));
      setCustomer(res.data);
    } catch {
      Alert.alert('Error', 'Failed to load customer');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!customer) return null;

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#064e3b', '#059669', '#06b884']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.2 }} className="px-6 pt-12 pb-8 rounded-b-[32px]">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center mb-4">
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <ThemedText className="text-white/60 text-xs font-medium tracking-widest uppercase">Customer</ThemedText>
        <ThemedText className="text-white text-2xl font-bold mt-1">{customer.name}</ThemedText>
      </LinearGradient>

      <View className="-mt-4 px-4 gap-4">
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 gap-3">
          {customer.email && (
            <View className="flex-row items-center gap-3">
              <Ionicons name="mail-outline" size={16} color="#9CA3AF" />
              <ThemedText className="text-gray-900 dark:text-white text-sm">{customer.email}</ThemedText>
            </View>
          )}
          {customer.phone && (
            <View className="flex-row items-center gap-3">
              <Ionicons name="call-outline" size={16} color="#9CA3AF" />
              <ThemedText className="text-gray-900 dark:text-white text-sm">{customer.phone}</ThemedText>
            </View>
          )}
          {customer.address && (
            <View className="flex-row items-center gap-3">
              <Ionicons name="location-outline" size={16} color="#9CA3AF" />
              <ThemedText className="text-gray-900 dark:text-white text-sm flex-1">{customer.address}</ThemedText>
            </View>
          )}
          {customer.tax_id && (
            <View className="flex-row items-center gap-3">
              <Ionicons name="receipt-outline" size={16} color="#9CA3AF" />
              <ThemedText className="text-gray-900 dark:text-white text-sm">TIN: {customer.tax_id}</ThemedText>
            </View>
          )}
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <ThemedText className="text-gray-500 dark:text-gray-400 text-xs">Total Purchases</ThemedText>
            <ThemedText className="text-green-600 font-bold text-lg mt-1">RWF {Number(customer.total_purchases).toLocaleString()}</ThemedText>
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <ThemedText className="text-gray-500 dark:text-gray-400 text-xs">Balance</ThemedText>
            <ThemedText className={`font-bold text-lg mt-1 ${customer.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
              RWF {Number(customer.balance).toLocaleString()}
            </ThemedText>
          </View>
        </View>

        {customer.notes && (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <ThemedText className="text-gray-500 dark:text-gray-400 text-xs mb-1">Notes</ThemedText>
            <ThemedText className="text-gray-900 dark:text-white text-sm">{customer.notes}</ThemedText>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
