import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { adminApi, clearAdminToken, getAdminToken, setAdminToken } from '../api/client';

type AdminUser = {
  id: number;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AdminUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(getAdminToken()));

  useEffect(() => {
    if (!getAdminToken()) return;

    adminApi
      .me()
      .then(setUser)
      .catch(() => clearAdminToken())
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => {
      clearAdminToken();
      setUser(null);
      setIsLoading(false);
    };

    window.addEventListener('admin-auth-expired', handleExpiredSession);

    return () => window.removeEventListener('admin-auth-expired', handleExpiredSession);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      async login(email, password) {
        const response = await adminApi.login(email, password);
        setAdminToken(response.token);
        setUser(response.admin);
      },
      async logout() {
        try {
          await adminApi.logout();
        } finally {
          clearAdminToken();
          setUser(null);
        }
      },
      updateUser(nextUser) {
        setUser(nextUser);
      },
    }),
    [isLoading, user],
  );

  useEffect(() => {
    if (!getAdminToken()) {
      setIsLoading(false);
    }
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
