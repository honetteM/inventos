import api from './api';
import type { LoginResponse, RegisterResponse, User } from '@/src/types/auth';

export interface LoginInput {
  email: string;
  password: string;
  device_name?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  company_name?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export async function login(data: LoginInput): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('auth/login', data);
  return response.data;
}

export async function register(data: RegisterInput): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>('auth/register', data);
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post('auth/logout');
}

export async function getMe(): Promise<{ user: User }> {
  const response = await api.get<{ user: User }>('auth/me');
  return response.data;
}

export async function forgotPassword(data: ForgotPasswordInput): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('auth/forgot-password', data);
  return response.data;
}

export async function resetPassword(data: ResetPasswordInput): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('auth/reset-password', data);
  return response.data;
}

export async function sendOtp(): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('auth/send-otp');
  return response.data;
}

export async function verifyOtp(otp: string): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('auth/verify-otp', { otp });
  return response.data;
}

export async function updateProfile(data: Partial<{ name: string; phone: string; locale: string }>): Promise<{ message: string; user: User }> {
  const response = await api.put<{ message: string; user: User }>('auth/profile', data);
  return response.data;
}
