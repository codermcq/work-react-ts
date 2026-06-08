import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Spin } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes';

const LazyFallback = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={LazyFallback}>
          <AppRoutes />
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
