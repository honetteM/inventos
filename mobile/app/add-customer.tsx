import { useState } from 'react';
import { ScrollView, TouchableOpacity, TextInput, View, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import * as salesService from '@/src/services/sales';

export default function AddCustomerScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Error', 'Customer name is required');
      return;
    }
    setSaving(true);
    try {
      await salesService.createCustomer({ name, email: email || undefined, phone: phone || undefined, address: address || undefined });
      Alert.alert('Success', 'Customer created successfully');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? e?.message ?? 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#064e3b', '#059669', '#06b884']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.2 }} className="px-6 pt-12 pb-8 rounded-b-[32px]">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center">
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View>
            <ThemedText className="text-white/50 text-xs font-medium tracking-widest uppercase">New</ThemedText>
            <ThemedText className="text-white text-2xl font-bold">Customer</ThemedText>
          </View>
        </View>
      </LinearGradient>

      <View className="-mt-4 px-4 gap-4">
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 gap-3">
          <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm" placeholder="Customer name *" placeholderTextColor="#9CA3AF" value={name} onChangeText={setName} />
          <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm" placeholder="Email" placeholderTextColor="#9CA3AF" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm" placeholder="Phone" placeholderTextColor="#9CA3AF" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm" placeholder="Address" placeholderTextColor="#9CA3AF" value={address} onChangeText={setAddress} multiline />
        </View>

        <TouchableOpacity onPress={handleSave} disabled={saving} className="bg-green-600 py-4 rounded-2xl items-center active:opacity-80">
          {saving ? <ActivityIndicator color="#fff" /> : <ThemedText className="text-white font-bold text-base">Save Customer</ThemedText>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
