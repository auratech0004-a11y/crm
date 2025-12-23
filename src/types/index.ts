export type Role = 'ADMIN' | 'EMPLOYEE' | 'LEAD';
export type Theme = 'light' | 'dark';

export interface Employee {
  id: string;
  employeeId?: string; // Custom employee ID set by admin
  name: string;
  username: string;
  password?: string;
  role: Role;
  salary: number;
  designation: string;
  joiningDate: string;
  status: 'active' | 'inactive';
  allowedModules?: string[];
  profilePic?: string; // Base64 or URL for profile picture
  phone?: string;
  email?: string;
  address?: string;
  leadId?: string; // For employees reporting to a lead
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Late';
  method: 'Auto' | 'Manual';
  location?: { lat: number; lng: number; address?: string };
}

export interface Fine {
  id: string;
  employeeId: string;
  amount: number;
  reason: string;
  date: string;
  status: 'Paid' | 'Unpaid';
}

export interface Leave {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
}

export interface Appeal {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'Absent' | 'Late' | 'Fine' | 'Salary' | 'Other';
  reason: string;
  message: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
  appealDate: string;
  relatedId?: string; // For linking to attendance/fine record
}
