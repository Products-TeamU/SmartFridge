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
  updateFamilyName: (name: string) => Promise<boolean>;
  deleteFamily: () => Promise<boolean>;
}

const extractFamily = (data: any): Family => {
  if (!data) {
    throw new Error('Пустой ответ от сервера');
  }

  // Если сервер вернул сразу объект семьи
  if (data._id && data.name && Array.isArray(data.members)) {
    return data as Family;
  }

  // Если сервер вернул { family: {...} }
  if (data.family && data.family._id) {
    return data.family as Family;
  }

  // Если сервер вернул { data: {...} }
  if (data.data && data.data._id) {
    return data.data as Family;
  }

  // Если сервер вернул { data: { family: {...} } }
  if (data.data && data.data.family && data.data.family._id) {
    return data.data.family as Family;
  }

  throw new Error('Неизвестный формат ответа family API');
};

export const useFamilyStore = create<FamilyState>((set, get) => ({
  family: null,
  isLoading: false,
  error: null,

  fetchFamily: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get('/family');
      const family = extractFamily(response.data);

      set({ family, isLoading: false });
    } catch (error: any) {
      if (error.response?.status === 404) {
        set({ family: null, error: null, isLoading: false });
      } else {
        set({
          error:
            error.response?.data?.message ||
            error.message ||
            'Ошибка загрузки семьи',
          isLoading: false,
        });
      }
    }
  },

  createFamily: async (name) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post('/family', { name });
      console.log('createFamily response:', response.data);

      const family = extractFamily(response.data);

      set({ family, isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Ошибка создания семьи',
        isLoading: false,
      });
      return false;
    }
  },

  joinFamily: async (inviteCode) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post('/family/join', { inviteCode });
      console.log('joinFamily response:', response.data);

      const family = extractFamily(response.data);

      set({ family, isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Ошибка присоединения',
        isLoading: false,
      });
      return false;
    }
  },

  removeMember: async (memberId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.delete(`/family/member/${memberId}`);
      const family = extractFamily(response.data);

      set({ family, isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Ошибка удаления участника',
        isLoading: false,
      });
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
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Ошибка выхода из семьи',
        isLoading: false,
      });
      return false;
    }
  },

  updateFamilyName: async (name: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.put('/family', { name });

      // Если сервер вернул обновлённую семью — берём её
      try {
        const family = extractFamily(response.data);
        set({ family, isLoading: false });
      } catch {
        // Если сервер не вернул семью — обновляем локально
        const currentFamily = get().family;
        if (currentFamily) {
          set({
            family: { ...currentFamily, name },
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
        }
      }

      return true;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Ошибка обновления названия',
        isLoading: false,
      });
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
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          'Ошибка удаления семьи',
        isLoading: false,
      });
      return false;
    }
  },

  resetFamily: () => set({ family: null, error: null, isLoading: false }),
}));