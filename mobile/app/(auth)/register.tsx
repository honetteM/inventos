import { useState } from 'react';
import {
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/src/context/auth-context';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
        phone: phone.trim() || undefined,
        company_name: companyName.trim() || undefined,
      });
    } catch (error: any) {
      console.error('Register error:', error?.response?.data || error?.message || error);
      const errors: Record<string, string[]> | undefined = error?.response?.data?.errors;
      const firstError = errors ? Object.values(errors)[0]?.[0] : null;
      const message = firstError || error?.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ThemedView className="flex-1">
        <LinearGradient
          colors={['#0c374b', '#0a7ea4', '#33b5e8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1"
        >
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <ThemedView className="flex-1 justify-center px-6 py-10">
                <ThemedView className="items-center mb-8">
                  <ThemedView className="w-24 h-24 bg-white/20 rounded-3xl items-center justify-center mb-6 border border-white/30 shadow-2xl">
                    <Ionicons name="rocket-outline" size={44} color="#fff" />
                  </ThemedView>
                  <ThemedText className="text-5xl font-bold text-white tracking-tight">
                    Get Started
                  </ThemedText>
                  <ThemedText className="text-white/60 text-base mt-2 text-center">
                    Start your journey with InventOS
                  </ThemedText>
                </ThemedView>

                <ThemedView className="bg-white/95 dark:bg-gray-900/95 rounded-3xl p-6 shadow-2xl border border-white/20 gap-5">
                  <ThemedView className="gap-1.5">
                    <ThemedText className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                      Full Name *
                    </ThemedText>
                    <ThemedView className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 border-2 border-gray-200 dark:border-gray-700">
                      <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                      <TextInput
                        className="flex-1 h-14 ml-3 text-gray-900 dark:text-white text-base"
                        placeholder="John Doe"
                        placeholderTextColor="#9CA3AF"
                        value={name}
                        onChangeText={setName}
                        editable={!loading}
                      />
                    </ThemedView>
                  </ThemedView>

                  <ThemedView className="gap-1.5">
                    <ThemedText className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                      Email *
                    </ThemedText>
                    <ThemedView className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 border-2 border-gray-200 dark:border-gray-700">
                      <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                      <TextInput
                        className="flex-1 h-14 ml-3 text-gray-900 dark:text-white text-base"
                        placeholder="name@example.com"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!loading}
                      />
                    </ThemedView>
                  </ThemedView>

                  <ThemedView className="gap-1.5">
                    <ThemedText className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                      Phone
                    </ThemedText>
                    <ThemedView className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 border-2 border-gray-200 dark:border-gray-700">
                      <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                      <TextInput
                        className="flex-1 h-14 ml-3 text-gray-900 dark:text-white text-base"
                        placeholder="+1 (555) 000-0000"
                        placeholderTextColor="#9CA3AF"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        editable={!loading}
                      />
                    </ThemedView>
                  </ThemedView>

                  <ThemedView className="gap-1.5">
                    <ThemedText className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                      Company Name
                    </ThemedText>
                    <ThemedView className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 border-2 border-gray-200 dark:border-gray-700">
                      <Ionicons name="business-outline" size={20} color="#9CA3AF" />
                      <TextInput
                        className="flex-1 h-14 ml-3 text-gray-900 dark:text-white text-base"
                        placeholder="Acme Inc."
                        placeholderTextColor="#9CA3AF"
                        value={companyName}
                        onChangeText={setCompanyName}
                        editable={!loading}
                      />
                    </ThemedView>
                  </ThemedView>

                  <ThemedView className="gap-1.5">
                    <ThemedText className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                      Password *
                    </ThemedText>
                    <ThemedView className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 border-2 border-gray-200 dark:border-gray-700">
                      <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                      <TextInput
                        className="flex-1 h-14 ml-3 text-gray-900 dark:text-white text-base"
                        placeholder="Min. 8 characters"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        editable={!loading}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1.5">
                        <Ionicons
                          name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                          size={20}
                          color="#9CA3AF"
                        />
                      </TouchableOpacity>
                    </ThemedView>
                  </ThemedView>

                  <ThemedView className="gap-1.5">
                    <ThemedText className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                      Confirm Password *
                    </ThemedText>
                    <ThemedView className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 border-2 border-gray-200 dark:border-gray-700">
                      <Ionicons name="shield-checkmark-outline" size={20} color="#9CA3AF" />
                      <TextInput
                        className="flex-1 h-14 ml-3 text-gray-900 dark:text-white text-base"
                        placeholder="Repeat your password"
                        placeholderTextColor="#9CA3AF"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        editable={!loading}
                      />
                    </ThemedView>
                  </ThemedView>

                  <TouchableOpacity
                    onPress={handleRegister}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={loading ? ['#0a7ea499', '#0a7ea499'] : ['#0a7ea4', '#0c374b']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="h-15 rounded-2xl items-center justify-center shadow-lg shadow-primary/30"
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <ThemedText className="text-white text-base font-bold tracking-wider">
                          Create Account
                        </ThemedText>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </ThemedView>

                <ThemedView className="flex-row justify-center items-center mt-6 mb-4">
                  <ThemedText className="text-white/60 text-sm">
                    Already have an account?{' '}
                  </ThemedText>
                  <TouchableOpacity onPress={() => router.back()}>
                    <ThemedText className="text-white font-bold text-sm underline">
                      Sign In
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}
