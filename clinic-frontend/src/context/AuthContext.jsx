import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from sessionStorage and verify with server on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = sessionStorage.getItem('token');
      const savedUser = sessionStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        try {
          // Verify token and get fresh user data
          const { data } = await api.get('/auth/me');
          if (data.success && data.user) {
            setUser(data.user);
            sessionStorage.setItem('user', JSON.stringify(data.user));
          } else {
            throw new Error('Verification failed');
          }
        } catch (err) {
          // If token invalid, clear session
          console.warn('Auth synchronization failed:', err.message);
          setToken(null);
          setUser(null);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    sessionStorage.setItem('token', authToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }, []);

  const updateUser = useCallback((updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    sessionStorage.setItem('user', JSON.stringify(updated));
  }, [user]);

  const isPro = user?.subscriptionPlan === 'pro';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isPro }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export default AuthContext;
