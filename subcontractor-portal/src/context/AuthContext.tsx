import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  companyId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authApi.me();
          // Only allow subcontractor role
          if (res.data.role === 'subcontractor') {
            setUser(res.data);
          } else {
            localStorage.removeItem('token');
            throw new Error('Access denied. This portal is for sub-contractors only.');
          }
        } catch {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.data.user.role !== 'subcontractor') {
      throw new Error('Access denied. This portal is for sub-contractors only.');
    }
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be inside AuthProvider');
  return context;
};
