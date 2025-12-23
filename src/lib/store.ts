import { Employee, Attendance, Fine, AuditLog, Leave, Appeal } from '@/types';

const STORAGE_KEYS = {
  EMPLOYEES: 'hrms_employees',
  ATTENDANCE: 'hrms_attendance',
  FINES: 'hrms_fines',
  LOGS: 'hrms_logs',
  SESSION: 'hrms_session',
  LEAVES: 'hrms_leaves',
  PAYROLL_STATUS: 'hrms_payroll_status',
  APPEALS: 'hrms_appeals',
  THEME: 'hrms_theme'
};

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'admin-1',
    name: 'A.R HR Admin',
    username: 'admin',
    password: '123',
    role: 'ADMIN',
    salary: 0,
    designation: 'Super Admin',
    joiningDate: '2023-01-01',
    status: 'active',
    allowedModules: ['dashboard', 'employees', 'payroll', 'attendance', 'reports', 'logs', 'permissions']
  },
  {
    id: 'emp-1',
    name: 'Babar Azam',
    username: 'babar',
    password: '12345678',
    role: 'EMPLOYEE',
    salary: 45000,
    designation: 'Graphic Designer',
    joiningDate: '2024-01-15',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'payroll', 'expense']
  },
  {
    id: 'emp-2',
    name: 'Sara Ahmed',
    username: 'sara',
    password: '12345678',
    role: 'EMPLOYEE',
    salary: 55000,
    designation: 'UI/UX Designer',
    joiningDate: '2024-02-01',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'payroll']
  },
  {
    id: 'emp-3',
    name: 'Ali Khan',
    username: 'ali',
    password: '12345678',
    role: 'EMPLOYEE',
    salary: 60000,
    designation: 'Full Stack Developer',
    joiningDate: '2023-06-10',
    status: 'active',
    allowedModules: ['dashboard', 'attendance', 'leave', 'payroll']
  }
];

export const storage = {
  getEmployees: (): Employee[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : INITIAL_EMPLOYEES;
  },
  setEmployees: (employees: Employee[]) => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  },
  getAttendance: (): Attendance[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : [];
  },
  setAttendance: (attendance: Attendance[]) => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  },
  getFines: (): Fine[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FINES);
    return data ? JSON.parse(data) : [];
  },
  setFines: (fines: Fine[]) => {
    localStorage.setItem(STORAGE_KEYS.FINES, JSON.stringify(fines));
  },
  getLeaves: (): Leave[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LEAVES);
    return data ? JSON.parse(data) : [];
  },
  setLeaves: (leaves: Leave[]) => {
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
  },
  getAppeals: (): Appeal[] => {
    const data = localStorage.getItem(STORAGE_KEYS.APPEALS);
    return data ? JSON.parse(data) : [];
  },
  setAppeals: (appeals: Appeal[]) => {
    localStorage.setItem(STORAGE_KEYS.APPEALS, JSON.stringify(appeals));
  },
  getPayrollStatus: (): Record<string, string> => {
    const data = localStorage.getItem(STORAGE_KEYS.PAYROLL_STATUS);
    return data ? JSON.parse(data) : {};
  },
  setPayrollStatus: (status: Record<string, string>) => {
    localStorage.setItem(STORAGE_KEYS.PAYROLL_STATUS, JSON.stringify(status));
  },
  getLogs: (): AuditLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  },
  setLogs: (logs: AuditLog[]) => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  },
  addLog: (action: string, details: string, user: string) => {
    const logs = storage.getLogs();
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      details,
      user,
      timestamp: new Date().toISOString()
    };
    storage.setLogs([newLog, ...logs].slice(0, 100));
  },
  getSession: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  },
  setSession: (user: Employee | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  },
  clearSession: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },
  getTheme: (): 'light' | 'dark' => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'dark';
  },
  setTheme: (theme: 'light' | 'dark') => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }
};
