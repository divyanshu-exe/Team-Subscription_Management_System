// OWNER: FE-1
// PURPOSE: Central Authentication Context holding logged in User and token actions

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../types';
import { getToken, setToken, clearToken } from '../lib/auth';
import { getMe, login as loginApi, logout as logoutApi, LoginInput } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginInput) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const me = await getMe();
      setUser(me);
    } catch (_) {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials: LoginInput) => {
    const res = await loginApi(credentials);
    setToken(res.token);
    setUser(res.user);

    // Redirect based on role
    if (res.user.role === 'CUSTOMER') {
      router.push('/my-subscriptions');
    } else {
      router.push('/dashboard');
    }

    return res.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
