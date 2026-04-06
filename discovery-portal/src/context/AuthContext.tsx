import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('discovery_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      setUser(res.data.user || res.data);
    } catch {
      localStorage.removeItem('discovery_token');
      localStorage.removeItem('discovery_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { token, user: u } = res.data;
    // Only allow sales, ops, admin, founder roles
    if (!['sales', 'ops', 'admin', 'founder'].includes(u.role)) {
      throw new Error('Access denied. Only internal users can access this portal.');
    }
    localStorage.setItem('discovery_token', token);
    localStorage.setItem('discovery_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('discovery_token');
    localStorage.removeItem('discovery_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
