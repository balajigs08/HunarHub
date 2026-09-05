import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import type { User, EntrepreneurProfile } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  profile: EntrepreneurProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, any>) => Promise<void>;
  registerEntrepreneur: (data: FormData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  updateProfile: (data: Partial<EntrepreneurProfile>) => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { token, user, profile } = res.data.data;
          localStorage.setItem('hunarhub_token', token);
          set({ user, token, profile: profile || null, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          const errMsg = error.response?.data?.message || 'Login failed. Please check credentials.';
          set({ isLoading: false, error: errMsg });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/register', data);
          const { token, user } = res.data.data;
          localStorage.setItem('hunarhub_token', token);
          set({ user, token, profile: null, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          const errMsg = error.response?.data?.message || 'Registration failed. Try again.';
          set({ isLoading: false, error: errMsg });
          throw error;
        }
      },

      registerEntrepreneur: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/register/entrepreneur', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const { token, user, profile } = res.data.data;
          localStorage.setItem('hunarhub_token', token);
          set({ user, token, profile, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          const errMsg = error.response?.data?.message || 'Registration failed.';
          set({ isLoading: false, error: errMsg });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('hunarhub_token');
        set({ user: null, token: null, profile: null, isAuthenticated: false, error: null });
      },

      refreshUser: async () => {
        const token = get().token || localStorage.getItem('hunarhub_token');
        if (!token) return;
        try {
          const res = await api.get('/auth/me');
          const { user, profile } = res.data.data;
          set({ user, profile: profile || null, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },

      fetchCurrentUser: async () => {
        return get().refreshUser();
      },

      updateProfile: (data) => {
        set((state) => ({ profile: state.profile ? { ...state.profile, ...data } : null }));
      },

      updateUser: (data) => {
        set((state) => ({ user: state.user ? { ...state.user, ...data } : null }));
      },
    }),
    {
      name: 'hunarhub_auth',
      partialize: (state) => ({ user: state.user, token: state.token, profile: state.profile, isAuthenticated: state.isAuthenticated }),
    }
  )
);
