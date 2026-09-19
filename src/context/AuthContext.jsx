import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      const storedUserContext = localStorage.getItem('userContext');

      if (token) {
        try {
          if (storedUserContext) {
            setUser(JSON.parse(storedUserContext));
          } else {
            const userData = await axiosClient.get('/auth/me');
            setUser(userData);
          }
        } catch (err) {
          console.warn('Backend token check failed, checking stored user session...', err);
          if (storedUserContext) {
            setUser(JSON.parse(storedUserContext));
          } else {
            localStorage.removeItem('authToken');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axiosClient.post('/auth/login', { username, password });
      if (response && response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userContext', JSON.stringify(response));
        setUser(response);
        return response;
      }
    } catch (err) {
      console.warn('Backend login API unreachable or failed, evaluating fallback credentials...', err);
    }

    // Fallback for Vercel preview / Standalone demo mode if backend is not deployed online
    const isAdminUser = username === 'admin' && password === 'admin123';
    const isManagerUser = (username.startsWith('manager_') || username === 'manager') && password === 'manager123';

    if (isAdminUser || isManagerUser) {
      const demoRole = isAdminUser ? 'ROLE_ADMIN' : 'ROLE_MANAGER';
      const cleanStoreCode = username.replace('manager_', '').replace('manager', 'S001').toUpperCase();
      const demoResponse = {
        token: 'demo-jwt-token-' + Date.now(),
        username: username,
        role: demoRole,
        fullName: isAdminUser ? 'Central Executive Admin' : `Manager (${cleanStoreCode})`,
        email: `${username}@geetham.com`,
        storeId: isAdminUser ? null : 1,
        storeCode: isAdminUser ? null : cleanStoreCode,
        storeName: isAdminUser ? null : `Annam ${cleanStoreCode} Store`,
      };
      localStorage.setItem('authToken', demoResponse.token);
      localStorage.setItem('userContext', JSON.stringify(demoResponse));
      setUser(demoResponse);
      return demoResponse;
    }

    throw new Error('Invalid username or password. Please check your credentials.');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userContext');
    setUser(null);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isManager = user?.role === 'ROLE_MANAGER';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin,
        isManager,
      }}
    >
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
