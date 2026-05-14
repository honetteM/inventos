import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { router, useSegments, useRootNavigationState } from 'expo-router';
import * as authService from '@/src/services/auth';
import { getToken, setToken, setStoredUser, clearAuth } from '@/src/storage/secure';
import type { User, AuthState } from '@/src/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: authService.RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function useProtectedRoute(user: User | null, isLoading: boolean) {
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState.key || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments, navigationState.key]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useProtectedRoute(state.user, state.isLoading);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await getToken();
      if (!storedToken) {
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
        return;
      }

      const response = await authService.getMe();
      setState({
        user: response.user,
        token: storedToken,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      await clearAuth();
      setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    try {
      await Promise.all([setToken(response.token), setStoredUser(JSON.stringify(response.user))]);
    } catch (e) {
      console.error('Failed to persist auth data', e);
    }
    setState({ user: response.user, token: response.token, isLoading: false, isAuthenticated: true });
  }, []);

  const register = useCallback(async (data: authService.RegisterInput) => {
    const response = await authService.register(data);
    try {
      await Promise.all([setToken(response.token), setStoredUser(JSON.stringify(response.user))]);
    } catch (e) {
      console.error('Failed to persist auth data', e);
    }
    setState({ user: response.user, token: response.token, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
    }
    await clearAuth();
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getMe();
      setState((prev) => ({ ...prev, user: response.user }));
    } catch {
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
