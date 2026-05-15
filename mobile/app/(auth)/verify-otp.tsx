import { useState, useRef } from 'react';
import { TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { verifyOtp } from '@/src/services/auth';

export default function VerifyOtpScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  async function handleVerify() {
    if (!otp.trim() || otp.length < 4) {
      Alert.alert('Error', 'Please enter a valid OTP code');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(otp.trim());
      Alert.alert('Verified', 'OTP verified successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Invalid or expired OTP';
      Alert.alert('Verification Failed', message);
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
                    <Ionicons name="qr-code-outline" size={44} color="#fff" />
                  </ThemedView>
                  <ThemedText className="text-5xl font-bold text-white tracking-tight">
                    Verify OTP
                  </ThemedText>
                  <ThemedText className="text-white/60 text-base mt-2 text-center px-4">
                    Enter the one-time code sent to your email.
                  </ThemedText>
                </ThemedView>

                <ThemedView className="bg-white/95 dark:bg-gray-900/95 rounded-3xl p-6 shadow-2xl border border-white/20 gap-6">
                  <TextInput
                    ref={inputRef}
                    className="h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-3xl text-center tracking-[12px]"
                    placeholder="000000"
                    placeholderTextColor="#9CA3AF"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                  />

                  <TouchableOpacity
                    onPress={handleVerify}
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
                          Verify
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
