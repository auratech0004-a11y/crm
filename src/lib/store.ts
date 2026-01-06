import { supabase } from '@/lib/supabaseClient';
import { Employee, Attendance, Fine, AuditLog, Leave, Appeal } from '@/types';

export const storage = {
  // Employees
  getEmployees: async (): Promise<Employee[]> => {
    try {
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

  // Attendance
  getAttendance: async (): Promise<Attendance[]> => {
    try {
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