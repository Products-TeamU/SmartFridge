import { create } from 'zustand';
import api from '../services/api';

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
      const response = await api.post('/family/create', { name });
      await get().fetchFamily(); // обновляем данные
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка создания семьи', isLoading: false });
      return false;
    }
  },

  joinFamily: async (inviteCode) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/family/join', { inviteCode });
      await get().fetchFamily();
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
      await get().fetchFamily();
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка удаления участника', isLoading: false });
      return false;
    }
  },

  leaveFamily: async () => {
    // leaveFamily требует отдельного эндпоинта? Если нет, можно удалить самого себя через removeMember
    // Пока реализуем через удаление текущего участника (нужно знать свой userId)
    const { family } = get();
    if (!family) return false;
    const currentUserId = (await import('../store/authStore')).useAuthStore.getState().user?.id;
    if (!currentUserId) return false;
    return get().removeMember(currentUserId);
  },

  resetFamily: () => set({ family: null, error: null, isLoading: false }),
}));