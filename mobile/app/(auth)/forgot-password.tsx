import { useState } from 'react';
import { TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { forgotPassword } from '@/src/services/auth';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to send reset link';
      Alert.alert('Error', message);
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
                    <Ionicons name="key-outline" size={44} color="#fff" />
                  </ThemedView>
                  <ThemedText className="text-5xl font-bold text-white tracking-tight">
                    Reset Password
                  </ThemedText>
                  <ThemedText className="text-white/60 text-base mt-2 text-center px-4">
                    {sent
                      ? "If an account exists with that email, we've sent a password reset link."
                      : "Enter your email and we'll send you a reset link."}
                  </ThemedText>
                </ThemedView>

                {!sent && (
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
                          editable={!loading}
                        />
                      </ThemedView>
                    </ThemedView>

                    <TouchableOpacity
                      onPress={handleSubmit}
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
                            Send Reset Link
                          </ThemedText>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </ThemedView>
                )}

                {sent && (
                  <ThemedView className="bg-white/95 dark:bg-gray-900/95 rounded-3xl p-8 shadow-2xl border border-white/20 items-center gap-4">
                    <ThemedView className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full items-center justify-center">
                      <Ionicons name="checkmark-circle" size={44} color="#22c55e" />
                    </ThemedView>
                    <ThemedText className="text-gray-900 dark:text-white text-center font-semibold text-base">
                      Check your email for the reset link
                    </ThemedText>
                  </ThemedView>
                )}

                <TouchableOpacity onPress={() => router.push('/(auth)/login')} className="items-center mt-8">
                  <ThemedText className="text-white text-sm font-semibold underline">
                    Back to Sign In
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}
