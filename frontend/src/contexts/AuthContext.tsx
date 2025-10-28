import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';
import type { AuthStatus } from '../types';
import { analytics } from '../utils/analytics';

interface AuthContextType extends AuthStatus {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ authenticated: false });
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const status = await api.checkAuthStatus();
      setAuthStatus(status);
    } catch (error) {
      console.error('Failed to check auth:', error);
      setAuthStatus({ authenticated: false });
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      const { authUrl } = await api.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
    }
  };

  const logout = async () => {
    try {
      analytics.logout();
      await api.logout();
      setAuthStatus({ authenticated: false });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  useEffect(() => {
    checkAuth();

    // Check URL params for auth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      analytics.loginSuccess();
      // Remove query params and refresh auth status
      window.history.replaceState({}, document.title, window.location.pathname);
      checkAuth();
    } else if (params.get('error')) {
      analytics.loginFailed();
      // Authentication failed - user will be redirected back to login page
      console.error('Authentication failed:', params.get('error'));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...authStatus, login, logout, checkAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
