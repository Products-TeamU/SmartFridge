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
  logout: () => Promise<void>;
  loadStoredToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true, // начинаем с true, чтобы показать загрузку при старте
  error: null,

  register: async (email, password, name) => {
  set({ isLoading: true, error: null });
  try {
    // Отправляем запрос на регистрацию
    await api.post('/auth/register', { email, password, name });
    // После успешной регистрации сразу логинимся
    return await useAuthStore.getState().login(email, password);
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
      await AsyncStorage.setItem('user', JSON.stringify(user));
      console.log('💾 Токен и пользователь сохранены');
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
    await AsyncStorage.removeItem('user');
    set({ user: null, token: null, error: null });
  },

  loadStoredToken: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ token, user, isLoading: false });
      } else {
        set({ token: null, user: null, isLoading: false });
      }
    } catch (error) {
      console.error('Ошибка загрузки токена:', error);
      set({ isLoading: false });
    }
  },
}));