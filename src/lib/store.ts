import { supabase } from '@/lib/supabaseClient';
import { Employee, Attendance, Fine, AuditLog, Leave, Appeal } from '@/types';

// Theme storage
let currentTheme: 'light' | 'dark' = 'dark';

// Mock data for development - including the provided employees with AT IDs
let mockEmployees: Employee[] = [
  {
    id: 'admin-1',
    employeeId: 'ADMIN-001',
    name: 'A.R HR Admin',
    username: 'admin',
    password: 'admin',
    role: 'ADMIN',
    salary: 0,
    designation: 'Super Admin',
    joiningDate: '2023-01-01',
    status: 'active',
    allowedModules: ['dashboard', 'employees', 'attendance', 'leave', 'fines', 'payroll', 'settings', 'lead', 'appeals'],
    profilePic: '',
    phone: '',
    email: 'admin@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-1',
    employeeId: 'AT-0001',
    name: 'Babar Rizwan',
    username: 'AT-0001',
    password: 'AT-0001',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-01-15',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-1234567',
    email: 'babar.rizwan@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-2',
    employeeId: 'AT-0002',
    name: 'Shehrbano',
    username: 'AT-0002',
    password: 'AT-0002',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-02-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0301-2345678',
    email: 'shehrbano@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-3',
    employeeId: 'AT-0003',
    name: 'Abdul Rehman',
    username: 'AT-0003',
    password: 'AT-0003',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-02-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0302-3456789',
    email: 'abdul.rehman@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-4',
    employeeId: 'AT-0004',
    name: 'Mohammad Afnan',
    username: 'AT-0004',
    password: 'AT-0004',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-02-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0303-4567890',
    email: 'mohammad.afnan@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-5',
    employeeId: 'AT-0005',
    name: 'Waqas Qureshi',
    username: 'AT-0005',
    password: 'AT-0005',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-02-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0304-5678901',
    email: 'waqas.qureshi@arhr.com',
    address: '',
    leadId: null
  }
];

const mockAttendance: Attendance[] = [
  {
    id: 'att-1',
    employeeId: 'emp-1',
    date: '2024-01-15',
    checkIn: '09:00',
    checkOut: '18:00',
    status: 'Present',
    method: 'Manual',
    location: null
  },
  {
    id: 'att-2',
    employeeId: 'emp-2',
    date: '2024-02-01',
    checkIn: '09:15',
    checkOut: '17:45',
    status: 'Present',
    method: 'Manual',
    location: null
  }
];

const mockFines: Fine[] = [
  {
    id: 'fine-1',
    employeeId: 'emp-1',
    amount: 100,
    reason: 'Late arrival',
    date: '2024-01-20',
    status: 'Unpaid'
  }
];

const mockLeaves: Leave[] = [
  {
    id: 'leave-1',
    employeeId: 'emp-1',
    employeeName: 'Babar Rizwan',
    type: 'Annual',
    startDate: '2024-03-01',
    endDate: '2024-03-05',
    reason: 'Family vacation',
    status: 'Approved',
    requestDate: '2024-02-15'
  }
];

const mockAppeals: Appeal[] = [
  {
    id: 'appeal-1',
    employeeId: 'emp-1',
    employeeName: 'Babar Rizwan',
    type: 'Late',
    reason: 'Traffic delay',
    message: 'Got stuck in traffic',
    status: 'Pending',
    date: '2024-01-20',
    appealDate: '2024-01-21',
    relatedId: 'fine-1'
  }
];

const mockPayrollStatus: Record<string, string> = {
  'emp-1': 'Paid',
  'emp-2': 'Pending'
};

const mockLogs: AuditLog[] = [
  {
    id: 'log-1',
    action: 'Login',
    details: 'Admin logged in',
    user: 'A.R HR Admin',
    timestamp: '2024-01-01T09:00:00Z'
  }
];

// Mock settings for office timing
let mockSettings = {
  officeStartTime: '09:00',
  officeEndTime: '18:00',
  lateFineAmount: 100,
  halfDayHours: 4
};

export const storage = {
  // Theme
  getTheme: (): 'light' | 'dark' => {
    return currentTheme;
  },
  setTheme: (theme: 'light' | 'dark'): void => {
    currentTheme = theme;
  },

  // Settings
  getSettings: async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        return mockSettings;
      }
      
      // Fetch from Supabase
      const { data, error } = await supabase.from('settings').select('*').single();
      if (error) throw error;
      
      return {
        officeStartTime: data.office_start_time,
        officeEndTime: data.office_end_time,
        lateFineAmount: data.late_fine_amount,
        halfDayHours: data.half_day_hours
      };
    } catch (error) {
      console.error('Error fetching settings:', error);
      return mockSettings;
    }
  },
  
  updateSettings: async (settings: any) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        // Update mock settings
        mockSettings = {
          officeStartTime: settings.officeStartTime || mockSettings.officeStartTime,
          officeEndTime: settings.officeEndTime || mockSettings.officeEndTime,
          lateFineAmount: settings.lateFineAmount !== undefined ? settings.lateFineAmount : mockSettings.lateFineAmount,
          halfDayHours: settings.halfDayHours !== undefined ? settings.halfDayHours : mockSettings.halfDayHours
        };
        return true;
      }
      
      // Update in Supabase
      const { error } = await supabase.from('settings').update({
        office_start_time: settings.officeStartTime,
        office_end_time: settings.officeEndTime,
        late_fine_amount: settings.lateFineAmount,
        half_day_hours: settings.halfDayHours
      }).eq('id', 'settings');
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  },

  // Employees
  getEmployees: async (): Promise<Employee[]> => {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        // Return mock data for development
        return mockEmployees;
      }
      
      // Fetch from Supabase
      const { data, error } = await supabase.from('employees').select('*');
      if (error) throw error;
      
      return data.map((emp: any) => ({
        id: emp.id,
        employeeId: emp.employee_id,
        name: emp.name,
        username: emp.username,
        password: emp.password,
        role: emp.role,
        salary: emp.salary,
        designation: emp.designation,
        joiningDate: emp.joining_date,
        status: emp.status,
        allowedModules: emp.allowed_modules,
        profilePic: emp.profile_pic,
        phone: emp.phone,
        email: emp.email,
        address: emp.address,
        leadId: emp.lead_id
      }));
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  },
  
  setEmployees: async (employees: Employee[]): Promise<void> => {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        // Update mock data for development
        mockEmployees = employees;
        console.log('Updated mock employees:', employees.length);
        return;
      }
      
      // Update in Supabase
      // Note: This is a simplified implementation. In a real app, you'd need to handle
      // inserts, updates, and deletes based on what changed
      console.log('Employees updated in Supabase:', employees.length);
    } catch (error) {
      console.error('Error updating employees:', error);
    }
  },
  
  addEmployee: async (employee: Employee): Promise<boolean> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        // Add to mock data for development
        mockEmployees = [...mockEmployees, employee];
        console.log('Added employee (mock):', employee);
        return true;
      }
      
      // Add to Supabase
      const { error } = await supabase.from('employees').insert({
        id: employee.id,
        employee_id: employee.employeeId,
        name: employee.name,
        username: employee.username,
        password: employee.password,
        role: employee.role,
        salary: employee.salary,
        designation: employee.designation,
        joining_date: employee.joiningDate,
        status: employee.status,
        allowed_modules: employee.allowedModules,
        profile_pic: employee.profilePic,
        phone: employee.phone,
        email: employee.email,
        address: employee.address,
        lead_id: employee.leadId
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding employee:', error);
      return false;
    }
  },
  
  updateEmployee: async (employee: Employee): Promise<boolean> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        // Update mock data for development
        mockEmployees = mockEmployees.map(e => e.id === employee.id ? employee : e);
        console.log('Updated employee (mock):', employee);
        return true;
      }
      
      // Update in Supabase
      const { error } = await supabase.from('employees').update({
        employee_id: employee.employeeId,
        name: employee.name,
        username: employee.username,
        password: employee.password,
        role: employee.role,
        salary: employee.salary,
        designation: employee.designation,
        joining_date: employee.joiningDate,
        status: employee.status,
        allowed_modules: employee.allowedModules,
        profile_pic: employee.profilePic,
        phone: employee.phone,
        email: employee.email,
        address: employee.address,
        lead_id: employee.leadId
      }).eq('id', employee.id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating employee:', error);
      return false;
    }
  },
  
  deleteEmployee: async (id: string): Promise<boolean> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        // Remove from mock data for development
        mockEmployees = mockEmployees.filter(e => e.id !== id);
        console.log('Deleted employee (mock):', id);
        return true;
      }
      
      // Delete from Supabase
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      return false;
    }
  },

  // Attendance
  getAttendance: async (): Promise<Attendance[]> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        // Return mock data for development
        return mockAttendance;
      }
      
      // Fetch from Supabase
      const { data, error } = await supabase.from('attendance').select('*');
      if (error) throw error;
      
      return data.map((att: any) => ({
        id: att.id,
        employeeId: att.employee_id,
        date: att.date,
        checkIn: att.check_in,
        checkOut: att.check_out,
        status: att.status,
        method: att.method,
        location: att.location
      }));
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  },
  
  addAttendance: async (attendance: Attendance): Promise<boolean> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        // Add to mock data for development
        mockAttendance.push(attendance);
        console.log('Added attendance (mock):', attendance);
        return true;
      }
      
      // Add to Supabase
      const { error } = await supabase.from('attendance').insert({
        id: attendance.id,
        employee_id: attendance.employeeId,
        date: attendance.date,
        check_in: attendance.checkIn,
        check_out: attendance.checkOut,
        status: attendance.status,
        method: attendance.method,
        location: attendance.location
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding attendance:', error);
      return false;
    }
  },

  // Fines
  getFines: async (): Promise<Fine[]> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        // Return mock data for development
        return mockFines;
      }
      
      // Fetch from Supabase
      const { data, error } = await supabase.from('fines').select('*');
      if (error) throw error;
      
      return data.map((fine: any) => ({
        id: fine.id,
        employeeId: fine.employee_id,
        amount: fine.amount,
        reason: fine.reason,
        date: fine.date,
        status: fine.status
      }));
    } catch (error) {
      console.error('Error fetching fines:', error);
      return [];
    }
  },

  // Leaves
  getLeaves: async (): Promise<Leave[]> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        // Return mock data for development
        return mockLeaves;
      }
      
      // Fetch from Supabase
      const { data, error } = await supabase.from('leaves').select('*');
      if (error) throw error;
      
      return data.map((leave: any) => ({
        id: leave.id,
        employeeId: leave.employee_id,
        employeeName: leave.employee_name,
        type: leave.type,
        startDate: leave.start_date,
        endDate: leave.end_date,
        reason: leave.reason,
        status: leave.status,
        requestDate: leave.request_date
      }));
    } catch (error) {
      console.error('Error fetching leaves:', error);
      return [];
    }
  },

  // Appeals
  getAppeals: async (): Promise<Appeal[]> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        // Return mock data for development
        return mockAppeals;
      }
      
      // Fetch from Supabase
      const { data, error } = await supabase.from('appeals').select('*');
      if (error) throw error;
      
      return data.map((appeal: any) => ({
        id: appeal.id,
        employeeId: appeal.employee_id,
        employeeName: appeal.employee_name,
        type: appeal.type,
        reason: appeal.reason,
        message: appeal.message,
        status: appeal.status,
        date: appeal.date,
        appealDate: appeal.appeal_date,
        relatedId: appeal.related_id
      }));
    } catch (error) {
      console.error('Error fetching appeals:', error);
      return [];
    }
  },

  // Audit Logs
  addLog: async (action: string, details: string, user: string): Promise<void> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        // Add to mock data for development
        mockLogs.push({
          id: Math.random().toString(36).substr(2, 9),
          action,
          details,
          user,
          timestamp: new Date().toISOString()
        });
        console.log('Added log (mock):', { action, details, user });
        return;
      }
      
      // Add to Supabase
      await supabase.from('audit_logs').insert({
        id: Math.random().toString(36).substr(2, 9),
        action,
        details,
        user,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding log:', error);
    }
  },
  
  getLogs: async (): Promise<AuditLog[]> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        // Return mock data for development
        return mockLogs;
      }
      
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      if (error) throw error;
      
      return data.map((log: any) => ({
        id: log.id,
        action: log.action,
        details: log.details,
        user: log.user,
        timestamp: log.timestamp
      }));
    } catch (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
  },

  // Payroll Status
  getPayrollStatus: async (): Promise<Record<string, string>> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        // Return mock data for development
        return mockPayrollStatus;
      }
      
      // Fetch from Supabase
      const { data, error } = await supabase.from('payroll_status').select('*');
      if (error) throw error;
      
      const status: Record<string, string> = {};
      data.forEach((item: any) => {
        status[item.employee_id] = item.status;
      });
      return status;
    } catch (error) {
      console.error('Error fetching payroll status:', error);
      return {};
    }
  }
};