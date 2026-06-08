import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

/**
 * 路由守卫：未登录 → 重定向到 /login
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/**
 * 已登录 → 跳过登录页，直接进 /dashboard
 */
export function RedirectIfAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
