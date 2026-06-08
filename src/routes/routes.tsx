import React from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { RequireAuth, RedirectIfAuth } from './guards';

const LoginPage = React.lazy(() =>
  import('../views/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = React.lazy(() =>
  import('../views/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: (
      <RedirectIfAuth>
        <LoginPage />
      </RedirectIfAuth>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <DashboardPage />
      </RequireAuth>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
];

export default routes;
