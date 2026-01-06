import { Employee, Attendance, Fine, AuditLog, Leave, Appeal } from '@/types';

// Mock data for development
const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP-001',
    name: 'John Doe',
    username: 'johndoe',
    role: 'EMPLOYEE',
    salary: 50000,
    designation: 'Software Engineer',
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
    designation: 'UI/UX Designer',
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

const mockAttendance: Attendance[] = [
  {
    id: '1',
    employeeId: '1',
    date: '2023-05-01',
    checkIn: '09:00',
    checkOut: '18:00',
    status: 'Present',
    method: 'Manual',
    location: null
  }
];

const mockFines: Fine[] = [
  {
    id: '1',
    employeeId: '1',
    amount: 100,
    reason: 'Late arrival',
    date: '2023-05-01',
    status: 'Unpaid'
  }
];

const mockLeaves: Leave[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    type: 'Annual',
    startDate: '2023-06-01',
    endDate: '2023-06-05',
    reason: 'Vacation',
    status: 'Approved',
    requestDate: '2023-05-15'
  }
];

const mockAppeals: Appeal[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    type: 'Late',
    reason: 'Traffic delay',
    message: 'Got stuck in traffic',
    status: 'Pending',
    date: '2023-05-01',
    appealDate: '2023-05-02',
    relatedId: '1'
  }
];

const mockPayrollStatus: Record<string, string> = {
  '1': 'Paid',
  '2': 'Pending'
};

const mockLogs: AuditLog[] = [
  {
    id: '1',
    action: 'Login',
    details: 'User logged in',
    user: 'John Doe',
    timestamp: '2023-05-01T09:00:00Z'
  }
];

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
      return mockEmployees;
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
      return mockAttendance;
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
      mockAttendance.push(attendance);
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
      return mockFines;
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
      return mockLeaves;
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
      return mockAppeals;
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
      mockLogs.push({
        id: Math.random().toString(36).substr(2, 9),
        action,
        details,
        user,
        timestamp: new Date().toISOString()
      });
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
      return mockLogs;
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
      return mockPayrollStatus;
    }
    
    // If Supabase is configured, return empty object as the real implementation is in api.ts
    return {};
  },
  setPayrollStatus: (status: Record<string, string>): void => {
    // In a real implementation, this would update the local cache
    console.log('Setting payroll status in storage');
  }
};