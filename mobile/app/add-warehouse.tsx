import { useState } from 'react';
import { ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as inventoryService from '@/src/services/inventory';

export default function AddWarehouseScreen() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) { Alert.alert('Error', 'Warehouse name is required'); return; }
    setSubmitting(true);
    try {
      await inventoryService.createWarehouse({ name: name.trim(), code: code.trim() || undefined, address: address.trim() || undefined, phone: phone.trim() || undefined, description: description.trim() || undefined });
      Alert.alert('Success', 'Warehouse created successfully', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) { Alert.alert('Error', e?.response?.data?.message ?? 'Failed to create warehouse'); }
    finally { setSubmitting(false); }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
      <LinearGradient colors={['#0a1f2e', '#0f4e6b', '#0a7ea4']} className="px-6 pt-12 pb-7 rounded-b-[32px]">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center mb-5 active:bg-white/25 border border-white/10">
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <ThemedText className="text-white text-2xl font-bold tracking-tight">New Warehouse</ThemedText>
        <ThemedText className="text-white/50 text-sm mt-1">Add a storage location</ThemedText>
      </LinearGradient>

      <View className="px-4 -mt-5 gap-3.5">
        <View className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700">
          <View className="flex-row items-center gap-3 mb-5">
            <View className="w-9 h-9 rounded-2xl bg-primary/10 items-center justify-center border border-primary/5"><Ionicons name="business-outline" size={18} color="#0a7ea4" /></View>
            <View><ThemedText className="text-gray-900 dark:text-white font-bold text-sm">Warehouse Details</ThemedText><ThemedText className="text-gray-400 dark:text-gray-500 text-[10px]">Enter warehouse information below</ThemedText></View>
          </View>
          <View className="gap-3.5">
            <View>
              <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Warehouse Name *</ThemedText>
              <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700" placeholder="e.g. Main Warehouse" placeholderTextColor="#9CA3AF" value={name} onChangeText={setName} />
            </View>
            <View>
              <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Code</ThemedText>
              <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700" placeholder="e.g. MAIN" placeholderTextColor="#9CA3AF" value={code} onChangeText={setCode} />
            </View>
            <View className="flex-row gap-2.5">
              <View className="flex-1">
                <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Address</ThemedText>
                <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700" placeholder="Optional address" placeholderTextColor="#9CA3AF" value={address} onChangeText={setAddress} />
              </View>
            </View>
            <View>
              <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Phone</ThemedText>
              <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700" placeholder="Optional phone number" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            </View>
            <View>
              <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Description</ThemedText>
              <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm min-h-[88px] border border-gray-200 dark:border-gray-700" placeholder="Optional description" placeholderTextColor="#9CA3AF" multiline numberOfLines={3} textAlignVertical="top" value={description} onChangeText={setDescription} />
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handleSubmit} disabled={submitting} className="bg-gray-900 dark:bg-white rounded-2xl py-4 items-center justify-center shadow-lg shadow-gray-900/20 mb-6 active:opacity-80">
          {submitting ? <ActivityIndicator color="#fff" /> : (
            <View className="flex-row items-center gap-2"><Ionicons name="business-outline" size={20} color="#fff" /><ThemedText className="text-white dark:text-gray-900 font-bold text-base">Create Warehouse</ThemedText></View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
