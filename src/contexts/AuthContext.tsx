import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee } from '@/types';
import { storage } from '@/lib/store';
import { fetchEmployees } from '@/integrations/supabase/service';

interface AuthContextType {
  user: Employee | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUser: (user: Employee) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Employee | null>(null);

  useEffect(() => {
    const session = storage.getSession();
    if (session) {
      setUser(session);
    }
    // initial user cache sync
    fetchEmployees().catch(() => {});
  }, []);

  const login = (username: string, password: string): boolean => {
    const employees = storage.getEmployees();
    const found = employees.find(e => e.username === username && e.password === password);
    if (found) {
      setUser(found);
      storage.setSession(found);
      storage.addLog('Login', `User ${found.username} logged in`, found.name);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (user) {
      storage.addLog('Logout', `User ${user.username} logged out`, user.name);
    }
    setUser(null);
    storage.clearSession();
  };

  const updateUser = (updatedUser: Employee) => {
    setUser(updatedUser);
    storage.setSession(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
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
