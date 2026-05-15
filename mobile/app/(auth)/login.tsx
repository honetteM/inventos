import { useState } from 'react';
import {
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Link } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/src/context/auth-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error: any) {
      console.error('Login error:', error?.response?.data || error?.message || error);
      const message = error?.response?.data?.message
        || error?.response?.data?.errors?.email?.[0]
        || 'Invalid credentials. Please try again.';
      Alert.alert('Login Failed', message);
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
                <ThemedView className="items-center mb-10">
                  <ThemedView className="w-24 h-24 bg-white/20 rounded-3xl items-center justify-center mb-6 border border-white/30 shadow-2xl">
                    <Ionicons name="cube" size={44} color="#fff" />
                  </ThemedView>
                  <ThemedText className="text-5xl font-bold text-white tracking-tight">
                    InventOS
                  </ThemedText>
                  <ThemedText className="text-white/60 text-base mt-2">
                    Sign in to your account
                  </ThemedText>
                </ThemedView>

                <ThemedView className="bg-white/95 dark:bg-gray-900/95 rounded-3xl p-6 shadow-2xl border border-white/20 gap-5">
                  <ThemedView className="gap-1.5">
                    <ThemedText className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                      Email
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
                        autoCorrect={false}
                        editable={!loading}
                      />
                    </ThemedView>
                  </ThemedView>

                  <ThemedView className="gap-1.5">
                    <ThemedText className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                      Password
                    </ThemedText>
                    <ThemedView className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 border-2 border-gray-200 dark:border-gray-700">
                      <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                      <TextInput
                        className="flex-1 h-14 ml-3 text-gray-900 dark:text-white text-base"
                        placeholder="Enter your password"
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

                  <TouchableOpacity
                    onPress={() => router.push('/(auth)/forgot-password')}
                    className="self-end -mt-1"
                  >
                    <ThemedText className="text-primary text-sm font-semibold">
                      Forgot password?
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleLogin}
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
                          Sign In
                        </ThemedText>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </ThemedView>

                <ThemedView className="flex-row justify-center items-center mt-8">
                  <ThemedText className="text-white/60 text-sm">
                    Don't have an account?{' '}
                  </ThemedText>
                  <Link href="/(auth)/register">
                    <ThemedText className="text-white font-bold text-sm underline">
                      Sign Up
                    </ThemedText>
                  </Link>
                </ThemedView>
              </ThemedView>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}
