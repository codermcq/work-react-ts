import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserInfo } from '../types';

interface AuthContextType {
  user: UserInfo | null;
  login: (user: UserInfo) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);

  const login = useCallback((userInfo: UserInfo) => {
    setUser(userInfo);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
