import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, Alert, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import * as inventoryService from '@/src/services/inventory';
import type { Category } from '@/src/types/inventory';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await inventoryService.getCategories({ per_page: 100 });
      setCategories(res.data ?? []);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to load categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  function onRefresh() { setRefreshing(true); fetchData(); }

  function openEdit(cat: Category) {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditDesc(cat.description ?? '');
  }

  async function handleEdit() {
    if (!editingCategory || !editName.trim()) return;
    setEditSubmitting(true);
    try {
      await inventoryService.updateCategory(editingCategory.id, { name: editName.trim(), description: editDesc.trim() || undefined });
      setEditingCategory(null);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to update category');
    } finally {
      setEditSubmitting(false);
    }
  }

  function confirmDelete(cat: Category) {
    Alert.alert('Delete Category', `Are you sure you want to delete "${cat.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => handleDelete(cat.id) },
    ]);
  }

  async function handleDelete(id: number) {
    try {
      await inventoryService.deleteCategory(id);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to delete category');
    }
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <LinearGradient colors={['#0a1f2e', '#0f4e6b', '#0a7ea4']} className="px-6 pt-12 pb-7 rounded-b-[32px]">
        <View className="flex-row items-center justify-between mb-5">
          <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center active:bg-white/25 border border-white/10">
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push({ pathname: '/add-category' as any })} className="w-9 h-9 bg-white/15 rounded-xl items-center justify-center active:bg-white/25 border border-white/10">
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <ThemedText className="text-white text-2xl font-bold tracking-tight">Categories</ThemedText>
        <ThemedText className="text-white/50 text-sm mt-1">Manage product categories</ThemedText>
      </LinearGradient>

      {loading ? (
        <View className="flex-1 items-center justify-center py-20"><ActivityIndicator size="large" color="#0a7ea4" /></View>
      ) : (
        <ScrollView className="flex-1 px-4 -mt-5" contentContainerStyle={{ paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a7ea4" />}>
          {categories.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-3xl p-10 items-center mt-3 border border-gray-100 dark:border-gray-700">
              <View className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-3xl items-center justify-center mb-5"><Ionicons name="folder-outline" size={36} color="#9CA3AF" /></View>
              <ThemedText className="text-gray-900 dark:text-white font-bold text-lg">No categories</ThemedText>
              <ThemedText className="text-gray-400 dark:text-gray-500 text-sm mt-1.5 text-center">Create your first category to organize products.</ThemedText>
              <TouchableOpacity onPress={() => router.push({ pathname: '/add-category' as any })} className="mt-6 bg-primary px-8 py-3.5 rounded-xl active:opacity-80">
                <ThemedText className="text-white font-bold text-sm">Add Category</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="mt-3 gap-2.5">
              {categories.map((cat) => (
                <TouchableOpacity key={cat.id} activeOpacity={0.7} onPress={() => router.push({ pathname: '/category/[id]', params: { id: String(cat.id) } })} className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-gray-700 flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center border border-primary/5">
                    <Ionicons name="folder-outline" size={20} color="#0a7ea4" />
                  </View>
                  <View className="flex-1 min-w-0">
                    <ThemedText className="text-gray-900 dark:text-white text-sm font-bold">{cat.name}</ThemedText>
                    {cat.description && <ThemedText className="text-gray-400 dark:text-gray-500 text-xs mt-0.5" numberOfLines={1}>{cat.description}</ThemedText>}
                    <ThemedText className="text-gray-400 dark:text-gray-500 text-[10px] mt-0.5">{cat.products_count ?? 0} products</ThemedText>
                  </View>
                  <TouchableOpacity onPress={() => openEdit(cat)} className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-xl items-center justify-center active:opacity-80">
                    <Ionicons name="pencil-outline" size={15} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(cat)} className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-xl items-center justify-center active:opacity-80">
                    <Ionicons name="trash-outline" size={15} color="#ef4444" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <Modal visible={!!editingCategory} transparent animationType="fade" onRequestClose={() => setEditingCategory(null)}>
        <Pressable className="flex-1 bg-black/40 justify-center px-6" onPress={() => setEditingCategory(null)}>
          <Pressable className="bg-white dark:bg-gray-800 rounded-3xl p-6" onPress={() => {}}>
            <View className="flex-row items-center gap-3 mb-5">
              <View className="w-9 h-9 rounded-2xl bg-primary/10 items-center justify-center"><Ionicons name="pencil-outline" size={18} color="#0a7ea4" /></View>
              <View><ThemedText className="text-gray-900 dark:text-white font-bold text-sm">Edit Category</ThemedText><ThemedText className="text-gray-400 dark:text-gray-500 text-[10px]">Update category details</ThemedText></View>
            </View>
            <View className="gap-3.5">
              <View>
                <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Name *</ThemedText>
                <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm border border-gray-200 dark:border-gray-700" value={editName} onChangeText={setEditName} placeholder="Category name" placeholderTextColor="#9CA3AF" />
              </View>
              <View>
                <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1.5">Description</ThemedText>
                <TextInput className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white text-sm min-h-[80px] border border-gray-200 dark:border-gray-700" value={editDesc} onChangeText={setEditDesc} placeholder="Optional description" placeholderTextColor="#9CA3AF" multiline numberOfLines={3} textAlignVertical="top" />
              </View>
            </View>
            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity onPress={() => setEditingCategory(null)} className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl py-3.5 items-center active:opacity-80">
                <ThemedText className="text-gray-600 dark:text-gray-400 font-bold text-sm">Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEdit} disabled={editSubmitting || !editName.trim()} className="flex-1 bg-gray-900 dark:bg-white rounded-2xl py-3.5 items-center active:opacity-80">
                {editSubmitting ? <ActivityIndicator color="#fff" /> : <ThemedText className="text-white dark:text-gray-900 font-bold text-sm">Save</ThemedText>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
