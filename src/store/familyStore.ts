import { create } from 'zustand';
import api from '../services/api';
import { useAuthStore } from './authStore';

interface Member {
  userId: { _id: string; name: string; email: string };
  role: 'admin' | 'member';
}

interface Family {
  _id: string;
  name: string;
  inviteCode: string;
  members: Member[];
  createdAt: string;
}

interface FamilyState {
  family: Family | null;
  isLoading: boolean;
  error: string | null;
  fetchFamily: () => Promise<void>;
  createFamily: (name?: string) => Promise<boolean>;
  joinFamily: (inviteCode: string) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
  leaveFamily: () => Promise<boolean>;
  resetFamily: () => void;
  updateFamilyName: (name: string) => Promise<boolean>;
  deleteFamily: () => Promise<boolean>;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  family: null,
  isLoading: false,
  error: null,

  fetchFamily: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/family');
      set({ family: response.data, isLoading: false });
    } catch (error: any) {
      if (error.response?.status === 404) {
        set({ family: null, isLoading: false });
      } else {
        set({ error: error.response?.data?.message || 'Ошибка загрузки семьи', isLoading: false });
      }
    }
  },

  createFamily: async (name) => {
    set({ isLoading: true, error: null });
    try {
      // Путь должен соответствовать бэкенду: POST /api/family
      const response = await api.post('/family', { name });
      set({ family: response.data, isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка создания семьи', isLoading: false });
      return false;
    }
  },

  joinFamily: async (inviteCode) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/family/join', { inviteCode });
      set({ family: response.data, isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка присоединения', isLoading: false });
      return false;
    }
  },

  removeMember: async (memberId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/family/member/${memberId}`);
      // Обновляем данные семьи после удаления
      await get().fetchFamily();
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка удаления участника', isLoading: false });
      return false;
    }
  },

  leaveFamily: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/family/leave');
      set({ family: null, isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка выхода из семьи', isLoading: false });
      return false;
    }
  },

  updateFamilyName: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.put('/family', { name });
      // Обновляем локальное состояние без повторного запроса
      const currentFamily = get().family;
      if (currentFamily) {
        set({ family: { ...currentFamily, name }, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка обновления названия', isLoading: false });
      return false;
    }
  },

  deleteFamily: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.delete('/family');
      set({ family: null, isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка удаления семьи', isLoading: false });
      return false;
    }
  },

  resetFamily: () => set({ family: null, error: null, isLoading: false }),
}));