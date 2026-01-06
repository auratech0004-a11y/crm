import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Employee } from '@/types';

interface AuthContextType {
  user: Employee | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (user: Employee) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch user data from Supabase
          const { data: employee, error } = await supabase
            .from('employees')
            .select('*')
            .eq('email', session.user.email)
            .single();
          
          if (employee && !error) {
            setUser({
              id: employee.id,
              employeeId: employee.employee_id,
              name: employee.name,
              username: employee.username,
              role: employee.role,
              salary: employee.salary,
              designation: employee.designation,
              joiningDate: employee.joining_date,
              status: employee.status,
              allowedModules: employee.allowed_modules,
              profilePic: employee.profile_pic,
              phone: employee.phone,
              email: employee.email,
              address: employee.address,
              leadId: employee.lead_id
            });
          }
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Fetch user data when auth state changes
        supabase
          .from('employees')
          .select('*')
          .eq('email', session.user.email)
          .single()
          .then(({ data: employee, error }) => {
            if (employee && !error) {
              setUser({
                id: employee.id,
                employeeId: employee.employee_id,
                name: employee.name,
                username: employee.username,
                role: employee.role,
                salary: employee.salary,
                designation: employee.designation,
                joiningDate: employee.joining_date,
                status: employee.status,
                allowedModules: employee.allowed_modules,
                profilePic: employee.profile_pic,
                phone: employee.phone,
                email: employee.email,
                address: employee.address,
                leadId: employee.lead_id
              });
            }
          });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // First, get the user's email from the employees table
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('email')
        .eq('username', username)
        .single();

      if (employeeError || !employee) {
        console.error('Employee not found:', employeeError);
        return false;
      }

      // Sign in with Supabase Auth using the email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: employee.email,
        password: password
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user) {
        // Fetch full employee data
        const { data: employeeData, error: fetchError } = await supabase
          .from('employees')
          .select('*')
          .eq('email', data.user.email)
          .single();

        if (employeeData && !fetchError) {
          setUser({
            id: employeeData.id,
            employeeId: employeeData.employee_id,
            name: employeeData.name,
            username: employeeData.username,
            role: employeeData.role,
            salary: employeeData.salary,
            designation: employeeData.designation,
            joiningDate: employeeData.joining_date,
            status: employeeData.status,
            allowedModules: employeeData.allowed_modules,
            profilePic: employeeData.profile_pic,
            phone: employeeData.phone,
            email: employeeData.email,
            address: employeeData.address,
            leadId: employeeData.lead_id
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (updatedUser: Employee) => {
    setUser(updatedUser);
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