import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../store/authStore';

describe('AuthStore Unit Tests', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('should initialize with null user and unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should clear user state upon logout', () => {
    useAuthStore.setState({
      user: {
        _id: '123',
        name: 'Test Customer',
        email: 'test@example.com',
        role: 'customer',
      },
      token: 'mock-jwt-token',
      isAuthenticated: true,
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
