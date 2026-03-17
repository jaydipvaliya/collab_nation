import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api, { setToken, clearToken } from '../api/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [isLoading, setIsLoading]     = useState(true);

  const isAuthenticated = !!user;

  // Run ONCE on mount — try to restore session
  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      try {
        // Use plain axios here — NOT the intercepted instance
        // This avoids the retry loop on failure
        const { data } = await axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        );
        if (!cancelled) {
          setToken(data.accessToken);
          setUser(data.user);
        }
      } catch {
        // No valid session — stay logged out, that's fine
        clearToken();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    restore();
    return () => { cancelled = true; };
  }, []); // Empty array = runs ONCE only

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearToken();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      loginWithGoogle,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};