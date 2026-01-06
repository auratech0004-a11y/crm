import { supabase } from '@/lib/supabaseClient';
import { Employee, Attendance, Fine, AuditLog, Leave, Appeal } from '@/types';

// Theme storage
let currentTheme: 'light' | 'dark' = 'dark';

// Mock data for development - including the provided employees
let mockEmployees: Employee[] = [
  {
    id: 'admin-1',
    employeeId: 'ADMIN-001',
    name: 'A.R HR Admin',
    username: 'admin',
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
    employeeId: 'EMP-001',
    name: 'Babar Azam',
    username: 'babar',
    role: 'EMPLOYEE',
    salary: 45000,
    designation: 'Graphic Designer',
    joiningDate: '2024-01-15',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-1234567',
    email: 'babar@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-2',
    employeeId: 'EMP-002',
    name: 'Sara Ahmed',
    username: 'sara',
    role: 'EMPLOYEE',
    salary: 55000,
    designation: 'UI/UX Designer',
    joiningDate: '2024-02-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0301-2345678',
    email: 'sara@arhr.com',
    address: '',
    leadId: null
  },
  // New employees from the image
  {
    id: 'emp-3',
    employeeId: 'DC-001',
    name: 'Muhammad Usman',
    username: 'muhammadusman',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000001',
    email: 'muhammadusman@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-4',
    employeeId: 'DC-002',
    name: 'Muhammad Awais',
    username: 'muhammadawais',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000002',
    email: 'muhammadawais@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-5',
    employeeId: 'DC-003',
    name: 'Muhammad Saad',
    username: 'muhammadsaad',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000003',
    email: 'muhammadsaad@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-6',
    employeeId: 'DC-004',
    name: 'Muhammad Talha',
    username: 'muhammadtalha',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000004',
    email: 'muhammadtalha@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-7',
    employeeId: 'DC-005',
    name: 'Muhammad Daniyal',
    username: 'muhammaddaniyal',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000005',
    email: 'muhammaddaniyal@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-8',
    employeeId: 'DC-006',
    name: 'Muhammad Haris',
    username: 'muhammadharis',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000006',
    email: 'muhammadharis@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-9',
    employeeId: 'DC-007',
    name: 'Muhammad Hassan',
    username: 'muhammadhassan',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000007',
    email: 'muhammadhassan@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-10',
    employeeId: 'DC-008',
    name: 'Muhammad Ahsan',
    username: 'muhammadahsan',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000008',
    email: 'muhammadahsan@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-11',
    employeeId: 'DC-009',
    name: 'Muhammad Faizan',
    username: 'muhammadfaizan',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000009',
    email: 'muhammadfaizan@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-12',
    employeeId: 'DC-010',
    name: 'Muhammad Zeeshan',
    username: 'muhammadzeeshan',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000010',
    email: 'muhammadzeeshan@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-13',
    employeeId: 'DC-011',
    name: 'Muhammad Asad',
    username: 'muhammadasad',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000011',
    email: 'muhammadasad@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-14',
    employeeId: 'DC-012',
    name: 'Muhammad Adil',
    username: 'muhammadadil',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000012',
    email: 'muhammadadil@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-15',
    employeeId: 'DC-013',
    name: 'Muhammad Bilal',
    username: 'muhammadbilal',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000013',
    email: 'muhammadbilal@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-16',
    employeeId: 'DC-014',
    name: 'Muhammad Zain',
    username: 'muhammadzain',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000014',
    email: 'muhammadzain@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-17',
    employeeId: 'DC-015',
    name: 'Muhammad Hamza',
    username: 'muhammadhamza',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000015',
    email: 'muhammadhamza@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-18',
    employeeId: 'DC-016',
    name: 'Muhammad Junaid',
    username: 'muhammadjunaid',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000016',
    email: 'muhammadjunaid@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-19',
    employeeId: 'DC-017',
    name: 'Muhammad Owais',
    username: 'muhammadowais',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000017',
    email: 'muhammadowais@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-20',
    employeeId: 'DC-018',
    name: 'Muhammad Sajid',
    username: 'muhammadsajid',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000018',
    email: 'muhammadsajid@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-21',
    employeeId: 'DC-019',
    name: 'Muhammad Imran',
    username: 'muhammadimran',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000019',
    email: 'muhammadimran@arhr.com',
    address: '',
    leadId: null
  },
  {
    id: 'emp-22',
    employeeId: 'DC-020',
    name: 'Muhammad Naveed',
    username: 'muhammadnaveed',
    role: 'EMPLOYEE',
    salary: 25000,
    designation: 'Digital Commerce Trainee',
    joiningDate: '2024-05-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'fines', 'salary'],
    profilePic: '',
    phone: '0300-0000020',
    email: 'muhammadnaveed@arhr.com',
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
    employeeName: 'Babar Azam',
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
    employeeName: 'Babar Azam',
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

// Mock settings with office timing
let mockSettings = {
  id: 'settings',
  office_start_time: '09:00',
  office_end_time: '18:00',
  late_fine_amount: 100,
  half_day_hours: 4
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
  getSettings: async (): Promise<any> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        return mockSettings;
      }
      
      const { data, error } = await supabase.from('settings').select('*').single();
      if (error) throw error;
      return data || mockSettings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return mockSettings;
    }
  },
  
  updateSettings: async (settings: any): Promise<boolean> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
        mockSettings = { ...mockSettings, ...settings };
        return true;
      }
      
      const { error } = await supabase.from('settings').upsert(settings, { onConflict: 'id' });
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