import { TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/src/context/auth-context';

const menuItems = [
  { icon: 'person-outline' as const, label: 'Edit Profile', color: '#0a7ea4' },
  { icon: 'settings-outline' as const, label: 'Settings', color: '#7c3aed' },
  { icon: 'notifications-outline' as const, label: 'Notifications', color: '#d97706' },
  { icon: 'help-circle-outline' as const, label: 'Help & Support', color: '#059669' },
  { icon: 'information-circle-outline' as const, label: 'About', color: '#6366f1' },
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
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#0c374b', '#0a7ea4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="items-center pt-14 pb-8 rounded-b-3xl"
      >
        <ThemedView className="w-24 h-24 bg-white/20 rounded-full items-center justify-center border-2 border-white/40 shadow-lg mb-4">
          <ThemedText className="text-white text-3xl font-bold">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </ThemedText>
        </ThemedView>
        <ThemedText className="text-white text-2xl font-bold">{user?.name}</ThemedText>
        <ThemedText className="text-white/70 text-sm mt-1">{user?.email}</ThemedText>
        {user?.phone && (
          <ThemedView className="flex-row items-center gap-1 mt-1">
            <Ionicons name="call-outline" size={14} color="#ffffffcc" />
            <ThemedText className="text-white/60 text-sm">{user.phone}</ThemedText>
          </ThemedView>
        )}
      </LinearGradient>

      <ThemedView className="mx-4 -mt-6 gap-3 mb-6">
        <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.6}
              className={`flex-row items-center px-4 py-4 ${index < menuItems.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
            >
              <ThemedView className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </ThemedView>
              <ThemedText className="flex-1 text-gray-900 dark:text-white font-medium ml-3">
                {item.label}
              </ThemedText>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </ThemedView>

        {user?.roles && (
          <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <ThemedText className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Roles
            </ThemedText>
            <ThemedView className="flex-row flex-wrap gap-2">
              {user.roles.map((role) => (
                <ThemedView key={role} className="bg-primary/10 px-3 py-1.5 rounded-xl">
                  <ThemedText className="text-primary text-sm font-semibold capitalize">{role}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          </ThemedView>
        )}

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-red-100 dark:border-red-900/30 flex-row items-center justify-center gap-2">
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <ThemedText className="text-red-500 text-base font-semibold">Sign Out</ThemedText>
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}
