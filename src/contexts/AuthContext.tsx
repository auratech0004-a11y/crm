import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '@/lib/store';
import { Employee } from '@/types';

interface AuthContextType {
  user: Employee | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUser: (user: Employee) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const employees = await storage.getEmployees();
        const savedUser = localStorage.getItem('hrms_user');
        
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          const currentUser = employees.find(e => e.id === userData.id);
          if (currentUser) {
            setUser(currentUser);
          } else {
            localStorage.removeItem('hrms_user');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (username: string, password: string): boolean => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
        !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
      // Mock login for development
      console.warn('Supabase not configured. Using mock login.');
      
      // Get employees from storage
      storage.getEmployees().then(employees => {
        const employee = employees.find(e => e.username === username && e.password === password);
        if (employee) {
          setUser(employee);
          localStorage.setItem('hrms_user', JSON.stringify(employee));
          return true;
        }
        return false;
      });
      
      return true;
    }
    
    try {
      // In a real implementation with Supabase, we would do proper authentication
      // For now, we'll simulate the same behavior
      storage.getEmployees().then(employees => {
        const employee = employees.find(e => e.username === username && e.password === password);
        if (employee) {
          setUser(employee);
          localStorage.setItem('hrms_user', JSON.stringify(employee));
        }
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('hrms_user');
    setUser(null);
  };

  const updateUser = (updatedUser: Employee) => {
    setUser(updatedUser);
    localStorage.setItem('hrms_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
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