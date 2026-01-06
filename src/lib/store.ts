import { supabase } from '@/lib/supabaseClient';
import { Employee, Attendance, Fine, AuditLog, Leave, Appeal } from '@/types';

// Theme storage
let currentTheme: 'light' | 'dark' = 'dark';

export const storage = {
  // Theme
  getTheme: (): 'light' | 'dark' => {
    return currentTheme;
  },
  setTheme: (theme: 'light' | 'dark'): void => {
    currentTheme = theme;
  },

  // Employees
  getEmployees: (): Employee[] => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
        !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
      console.warn('Supabase not configured. Returning mock employees.');
      // Return mock employees for development
      return [
        {
          id: '1',
          employeeId: 'EMP-001',
          name: 'John Doe',
          username: 'johndoe',
          role: 'EMPLOYEE',
          salary: 50000,
          designation: 'Digital Commerce Trainee',
          joiningDate: '2023-01-15',
          status: 'active',
          allowedModules: ['dashboard', 'attendance', 'leave', 'fines'],
          profilePic: '',
          phone: '123-456-7890',
          email: 'john@example.com',
          address: '123 Main St, City',
          leadId: null
        },
        {
          id: '2',
          employeeId: 'EMP-002',
          name: 'Jane Smith',
          username: 'janesmith',
          role: 'EMPLOYEE',
          salary: 55000,
          designation: 'Digital Commerce Associate',
          joiningDate: '2023-02-20',
          status: 'active',
          allowedModules: ['dashboard', 'attendance', 'leave', 'fines'],
          profilePic: '',
          phone: '098-765-4321',
          email: 'jane@example.com',
          address: '456 Oak Ave, City',
          leadId: null
        }
      ];
    }
    
    // If Supabase is configured, return empty array as the real implementation is in api.ts
    return [];
  },
  setEmployees: (employees: Employee[]): void => {
    // In a real implementation, this would update the local cache
    console.log('Setting employees in storage:', employees.length);
  },

  // Attendance
  getAttendance: (): Attendance[] => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
        !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
      console.warn('Supabase not configured. Returning mock attendance.');
      // Return mock attendance for development
      return [
        {
          id: '1',
          employeeId: '1',
          date: new Date().toISOString().split('T')[0],
          checkIn: '09:00',
          checkOut: '18:00',
          status: 'Present',
          method: 'Manual',
          location: null
        }
      ];
    }
    
    // If Supabase is configured, return empty array as the real implementation is in api.ts
    return [];
  },
  setAttendance: (attendance: Attendance[]): void => {
    // In a real implementation, this would update the local cache
    console.log('Setting attendance in storage:', attendance.length);
  },
  addAttendance: (attendance: Attendance): boolean => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
        !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
      console.warn('Supabase not configured. Adding mock attendance.');
      // In a real implementation, this would add to the database
      return true;
    }
    
    // If Supabase is configured, return false as the real implementation is in api.ts
    return false;
  },

  // Fines
  getFines: (): Fine[] => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
        !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
      console.warn('Supabase not configured. Returning mock fines.');
      // Return mock fines for development
      return [
        {
          id: '1',
          employeeId: '1',
          amount: 100,
          reason: 'Late arrival',
          date: new Date().toISOString().split('T')[0],
          status: 'Unpaid'
        }
      ];
    }
    
    // If Supabase is configured, return empty array as the real implementation is in api.ts
    return [];
  },
  setFines: (fines: Fine[]): void => {
    // In a real implementation, this would update the local cache
    console.log('Setting fines in storage:', fines.length);
  },

  // Leaves
  getLeaves: (): Leave[] => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
        !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
      console.warn('Supabase not configured. Returning mock leaves.');
      // Return mock leaves for development
      return [
        {
          id: '1',
          employeeId: '1',
          employeeName: 'John Doe',
          type: 'Annual',
          startDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          endDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
          reason: 'Vacation',
          status: 'Approved',
          requestDate: new Date().toISOString().split('T')[0]
        }
      ];
    }
    
    // If Supabase is configured, return empty array as the real implementation is in api.ts
    return [];
  },
  setLeaves: (leaves: Leave[]): void => {
    // In a real implementation, this would update the local cache
    console.log('Setting leaves in storage:', leaves.length);
  },

  // Appeals
  getAppeals: (): Appeal[] => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
        !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
      console.warn('Supabase not configured. Returning mock appeals.');
      // Return mock appeals for development
      return [
        {
          id: '1',
          employeeId: '1',
          employeeName: 'John Doe',
          type: 'Late',
          reason: 'Traffic delay',
          message: 'Got stuck in traffic',
          status: 'Pending',
          date: new Date().toISOString().split('T')[0],
          appealDate: new Date().toISOString().split('T')[0],
          relatedId: '1'
        }
      ];
    }
    
    // If Supabase is configured, return empty array as the real implementation is in api.ts
    return [];
  },
  setAppeals: (appeals: Appeal[]): void => {
    // In a real implementation, this would update the local cache
    console.log('Setting appeals in storage:', appeals.length);
  },

  // Audit Logs
  addLog: (action: string, details: string, user: string): void => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
        !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
      console.warn('Supabase not configured. Adding mock log.');
      // In a real implementation, this would add to the database
      return;
    }
    
    // If Supabase is configured, do nothing as the real implementation is in api.ts
    return;
  },
  getLogs: (): AuditLog[] => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
        !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
      console.warn('Supabase not configured. Returning mock logs.');
      // Return mock logs for development
      return [
        {
          id: '1',
          action: 'Login',
          details: 'User logged in',
          user: 'John Doe',
          timestamp: new Date().toISOString()
        }
      ];
    }
    
    // If Supabase is configured, return empty array as the real implementation is in api.ts
    return [];
  },

  // Payroll Status
  getPayrollStatus: (): Record<string, string> => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
        !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
      console.warn('Supabase not configured. Returning mock payroll status.');
      // Return mock payroll status for development
      return {
        '1': 'Paid',
        '2': 'Pending'
      };
    }
    
    // If Supabase is configured, return empty object as the real implementation is in api.ts
    return {};
  },
  setPayrollStatus: (status: Record<string, string>): void => {
    // In a real implementation, this would update the local cache
    console.log('Setting payroll status in storage');
  }
};