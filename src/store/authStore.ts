import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadStoredToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/register', { email, password, name });
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка регистрации';
      set({ error: message, isLoading: false });
      return false;
    }
  },

login: async (email, password) => {
  console.log('📤 Отправка запроса входа для:', email);
  set({ isLoading: true, error: null });
  try {
    const response = await api.post('/auth/login', { email, password });
    console.log('✅ Ответ от сервера:', response.data);
    const { token, user } = response.data;
    await AsyncStorage.setItem('token', token);
    console.log('💾 Токен сохранён в AsyncStorage');
    set({ token, user, isLoading: false });
    return true;
  } catch (error: any) {
    console.error('❌ Ошибка входа:', error.response?.data || error.message);
    const message = error.response?.data?.message || 'Ошибка входа';
    set({ error: message, isLoading: false });
    return false;
  }
},
  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ user: null, token: null, error: null });
  },

  loadStoredToken: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Можно также запросить данные пользователя по токену, но пока просто сохраняем токен
        set({ token, isLoading: false });
        // Здесь можно позже добавить запрос /me, если будет такой эндпоинт
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));