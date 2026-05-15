import { useState } from 'react';
import { TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { resetPassword } from '@/src/services/auth';

export default function ResetPasswordScreen() {
  const { email: emailParam, token: tokenParam } = useLocalSearchParams<{ email: string; token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!password || password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({
        email: emailParam,
        token: tokenParam,
        password,
        password_confirmation: confirmPassword,
      });
      Alert.alert('Success', 'Password has been reset successfully.', [
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to reset password';
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
                    <Ionicons name="lock-open-outline" size={44} color="#fff" />
                  </ThemedView>
                  <ThemedText className="text-5xl font-bold text-white tracking-tight">
                    New Password
                  </ThemedText>
                  <ThemedText className="text-white/60 text-base mt-2">
                    Enter your new password below.
                  </ThemedText>
                </ThemedView>

                <ThemedView className="bg-white/95 dark:bg-gray-900/95 rounded-3xl p-6 shadow-2xl border border-white/20 gap-5">
                  <ThemedView className="gap-1.5">
                    <ThemedText className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                      New Password
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
                      Confirm New Password
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
                          Reset Password
                        </ThemedText>
                      )}
                    </LinearGradient>
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
