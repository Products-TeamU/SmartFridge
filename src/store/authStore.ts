import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { navigationRef } from '../navigation/RootNavigation';
import { useFamilyStore } from './familyStore';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  register: (
    email: string,
    password: string,
    name: string,
    avatarId?: string
  ) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loadStoredToken: () => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  setUser: (user: User) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  error: null,

  register: async (email, password, name, avatarId = 'person-green') => {
    set({ isLoading: true, error: null });

    try {
      await api.post('/auth/register', {
        email,
        password,
        name,
        avatarId,
      });

      const loginSuccess = await get().login(email, password);
      return loginSuccess;
    } catch (error: any) {
      console.error('❌ Ошибка регистрации:', error.response?.data || error.message);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Ошибка регистрации';

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

      const normalizedUser: User = {
        ...user,
        avatarId: user?.avatarId || 'person-green',
      };

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
      console.log('💾 Токен и пользователь сохранены');

      set({
        token,
        user: normalizedUser,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error: any) {
      console.error('❌ Ошибка входа:', error.response?.data || error.message);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Ошибка входа';

      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');

    useFamilyStore.getState().resetFamily();

    set({
      user: null,
      token: null,
      error: null,
      isLoading: false,
    });

    if (navigationRef.isReady()) {
      navigationRef.resetRoot({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  },

  loadStoredToken: async () => {
    set({ isLoading: true });

    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');

      if (token && userStr) {
        const parsedUser = JSON.parse(userStr);

        const normalizedUser: User = {
          ...parsedUser,
          avatarId: parsedUser?.avatarId || 'person-green',
        };

        set({
          token,
          user: normalizedUser,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          token: null,
          user: null,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки токена:', error);
      set({
        token: null,
        user: null,
        isLoading: false,
        error: 'Ошибка загрузки токена',
      });
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    set({ isLoading: true, error: null });

    try {
      await api.post('/auth/reset-password', { token, newPassword });
      set({ isLoading: false, error: null });
      return true;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Ошибка сброса пароля';

      set({ error: message, isLoading: false });
      return false;
    }
  },

  setUser: async (user) => {
    const normalizedUser: User = {
      ...user,
      avatarId: user?.avatarId || 'person-green',
    };

    await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
    set({ user: normalizedUser });
  },
}));