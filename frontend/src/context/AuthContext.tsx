import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api, getAuthToken, updateLastActiveTime, clearAuthToken } from '../services/api';
import type { User } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; role?: string; department?: string }) => Promise<void>;
  logout: () => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  demoLoginEnabled: boolean;
  setDemoLoginEnabled: (val: boolean) => void;
  refreshSystemSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  
  // Theme state (default: light mode for maximum readability)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('campuspulse_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('campuspulse_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Demo Mode State (default disabled)
  const [demoLoginEnabled, setDemoLoginEnabled] = useState<boolean>(() => {
    const cached = localStorage.getItem('digi_demo_login_enabled');
    return cached === 'true';
  });

  const refreshSystemSettings = async () => {
    try {
      const settings = await api.getPublicSettings();
      setDemoLoginEnabled(!!settings.demoLoginEnabled);
      localStorage.setItem('digi_demo_login_enabled', settings.demoLoginEnabled ? 'true' : 'false');
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    refreshSystemSettings();
  }, []);

  // Check auth session on load (using sessionStorage to guarantee logout when browser is closed)
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getMe()
        .then(userData => setUser(userData))
        .catch(() => {
          api.logout();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      // Clear any legacy token from previous version
      clearAuthToken();
      setLoading(false);
    }
  }, []);

  // Track user activity to refresh session timer & monitor expiration
  useEffect(() => {
    let lastThrottledTime = 0;
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastThrottledTime > 30000) { // Throttle activity updates to every 30 seconds
        lastThrottledTime = now;
        updateLastActiveTime();
      }
    };

    // User activity listeners
    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('click', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });
    window.addEventListener('scroll', handleUserActivity, { passive: true });

    // Periodic heartbeat to automatically log out if session expires
    const expiryInterval = setInterval(() => {
      const currentToken = getAuthToken();
      if (!currentToken && user) {
        // Session has expired
        setUser(null);
        alert('⏱️ Session Expired: You have been automatically logged out due to inactivity or session expiry.');
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      clearInterval(expiryInterval);
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    if (data.user) setUser(data.user);
    setAuthModalOpen(false);
  };

  const register = async (userData: { name: string; email: string; password: string; role?: string; department?: string }) => {
    const data = await api.register(userData);
    if (data.user) setUser(data.user);
    setAuthModalOpen(false);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    refreshSystemSettings();
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      openAuthModal,
      closeAuthModal,
      authModalOpen,
      authModalMode,
      theme,
      toggleTheme,
      demoLoginEnabled,
      setDemoLoginEnabled: (val: boolean) => {
        setDemoLoginEnabled(val);
        localStorage.setItem('digi_demo_login_enabled', val ? 'true' : 'false');
      },
      refreshSystemSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
