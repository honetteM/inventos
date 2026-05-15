import { TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/src/context/auth-context';

const menuSections = [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline' as const, label: 'Edit Profile', color: '#0a7ea4' },
      { icon: 'lock-closed-outline' as const, label: 'Security', color: '#7c3aed' },
      { icon: 'notifications-outline' as const, label: 'Notifications', color: '#d97706' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline' as const, label: 'Help Center', color: '#059669' },
      { icon: 'information-circle-outline' as const, label: 'About', color: '#6366f1' },
    ],
  },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#0a1f2e', '#0f4e6b', '#0a7ea4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        className="items-center pt-6 pb-24 rounded-b-[32px]"
      >
        <TouchableOpacity activeOpacity={0.8}>
          <ThemedView
            className="w-28 h-28 bg-white/15 rounded-full items-center justify-center border-[3px] border-white/30 mb-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 }}
          >
            <ThemedText className="text-white text-4xl font-bold">
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </ThemedText>
            <ThemedView className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full items-center justify-center border-2 border-white">
              <Ionicons name="camera" size={14} color="#fff" />
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
        <ThemedText className="text-white text-2xl font-bold">{user?.name ?? 'User'}</ThemedText>
        <ThemedView className="flex-row items-center gap-1.5 mt-1">
          <Ionicons name="mail-outline" size={14} color="#ffffffcc" />
          <ThemedText className="text-white/70 text-sm">{user?.email}</ThemedText>
        </ThemedView>
        {user?.phone && (
          <ThemedView className="flex-row items-center gap-1.5 mt-1">
            <Ionicons name="call-outline" size={14} color="#ffffffcc" />
            <ThemedText className="text-white/60 text-sm">{user.phone}</ThemedText>
          </ThemedView>
        )}
      </LinearGradient>

      <ThemedView className="mx-4 -mt-16 gap-4">
        <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <ThemedView className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <ThemedView className="flex-row items-center gap-2">
              <ThemedView className="w-7 h-7 rounded-lg bg-primary/10 items-center justify-center">
                <Ionicons name="person-outline" size={14} color="#0a7ea4" />
              </ThemedView>
              <ThemedText className="text-gray-900 dark:text-white font-bold text-sm">Account Info</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView className="px-4 py-3 gap-2.5">
            <ThemedView className="flex-row items-center justify-between">
              <ThemedText className="text-gray-400 dark:text-gray-500 text-xs">Tenant</ThemedText>
              <ThemedText className="text-gray-900 dark:text-white text-sm font-semibold">{user?.tenant?.name ?? 'N/A'}</ThemedText>
            </ThemedView>
            {user?.phone && (
              <ThemedView className="flex-row items-center justify-between">
                <ThemedText className="text-gray-400 dark:text-gray-500 text-xs">Phone</ThemedText>
                <ThemedText className="text-gray-900 dark:text-white text-sm font-semibold">{user.phone}</ThemedText>
              </ThemedView>
            )}
          </ThemedView>
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7} className="border-t border-gray-100 dark:border-gray-700 flex-row items-center justify-center px-4 py-3 gap-2 bg-red-50/50 dark:bg-red-900/10">
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            <ThemedText className="text-red-500 text-sm font-bold">Sign Out</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {menuSections.map((section) => (
          <ThemedView key={section.title}>
            <ThemedText className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 px-1">
              {section.title}
            </ThemedText>
            <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.6}
                  className={`flex-row items-center px-4 py-4 ${index < section.items.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                >
                  <ThemedView className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </ThemedView>
                  <ThemedText className="flex-1 text-gray-900 dark:text-white font-semibold ml-3">{item.label}</ThemedText>
                  <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>
        ))}

        {user?.roles && (
          <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <ThemedView className="flex-row items-center gap-2 mb-4">
              <ThemedView className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                <Ionicons name="shield-checkmark-outline" size={16} color="#0a7ea4" />
              </ThemedView>
              <ThemedText className="text-gray-900 dark:text-white font-bold text-sm">Access Control</ThemedText>
            </ThemedView>
            <ThemedView className="flex-row flex-wrap gap-2">
              {user.roles.map((role) => (
                <ThemedView key={role} className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 flex-row items-center gap-1.5">
                  <Ionicons name="checkmark-circle" size={14} color="#0a7ea4" />
                  <ThemedText className="text-primary text-sm font-bold capitalize">{role.replace('_', ' ')}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}
