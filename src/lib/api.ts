import { supabase } from '@/lib/supabaseClient';
import { Employee, Attendance, Leave, Fine, Appeal } from '@/types';

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  logout: async () => {
    return await supabase.auth.signOut();
  },
  getMe: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  },
  changePassword: async (newPassword: string) => {
    return await supabase.auth.updateUser({ password: newPassword });
  }
};

// Employee API
export const employeeAPI = {
  getAll: async (): Promise<Employee[]> => {
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
  },
  getById: async (id: string): Promise<Employee | null> => {
    const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
    if (error) throw error;
    
    return data ? {
      id: data.id,
      employeeId: data.employee_id,
      name: data.name,
      username: data.username,
      role: data.role,
      salary: data.salary,
      designation: data.designation,
      joiningDate: data.joining_date,
      status: data.status,
      allowedModules: data.allowed_modules,
      profilePic: data.profile_pic,
      phone: data.phone,
      email: data.email,
      address: data.address,
      leadId: data.lead_id
    } : null;
  },
  create: async (employee: Omit<Employee, 'id'>) => {
    const { data, error } = await supabase.from('employees').insert({
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
    }).select();
    
    if (error) throw error;
    return data[0];
  },
  update: async (id: string, employee: Partial<Employee>) => {
    const { data, error } = await supabase.from('employees').update({
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
    }).eq('id', id).select();
    
    if (error) throw error;
    return data[0];
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};

// Attendance API
export const attendanceAPI = {
  getAll: async (): Promise<Attendance[]> => {
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
  },
  create: async (attendance: Omit<Attendance, 'id'>) => {
    const { data, error } = await supabase.from('attendance').insert({
      employee_id: attendance.employeeId,
      date: attendance.date,
      check_in: attendance.checkIn,
      check_out: attendance.checkOut,
      status: attendance.status,
      method: attendance.method,
      location: attendance.location
    }).select();
    
    if (error) throw error;
    return data[0];
  },
  update: async (id: string, attendance: Partial<Attendance>) => {
    const { data, error } = await supabase.from('attendance').update({
      check_out: attendance.checkOut,
      status: attendance.status,
      location: attendance.location
    }).eq('id', id).select();
    
    if (error) throw error;
    return data[0];
  }
};

// Leave API
export const leaveAPI = {
  getAll: async (): Promise<Leave[]> => {
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
  },
  create: async (leave: Omit<Leave, 'id'>) => {
    const { data, error } = await supabase.from('leaves').insert({
      employee_id: leave.employeeId,
      employee_name: leave.employeeName,
      type: leave.type,
      start_date: leave.startDate,
      end_date: leave.endDate,
      reason: leave.reason,
      status: leave.status,
      request_date: leave.requestDate
    }).select();
    
    if (error) throw error;
    return data[0];
  },
  update: async (id: string, leave: Partial<Leave>) => {
    const { data, error } = await supabase.from('leaves').update({
      status: leave.status
    }).eq('id', id).select();
    
    if (error) throw error;
    return data[0];
  }
};

// Fine API
export const fineAPI = {
  getAll: async (): Promise<Fine[]> => {
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
  },
  create: async (fine: Omit<Fine, 'id'>) => {
    const { data, error } = await supabase.from('fines').insert({
      employee_id: fine.employeeId,
      amount: fine.amount,
      reason: fine.reason,
      date: fine.date,
      status: fine.status
    }).select();
    
    if (error) throw error;
    return data[0];
  },
  update: async (id: string, fine: Partial<Fine>) => {
    const { data, error } = await supabase.from('fines').update({
      status: fine.status
    }).eq('id', id).select();
    
    if (error) throw error;
    return data[0];
  }
};

// Appeal API
export const appealAPI = {
  getAll: async (): Promise<Appeal[]> => {
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
  },
  create: async (appeal: Omit<Appeal, 'id'>) => {
    const { data, error } = await supabase.from('appeals').insert({
      employee_id: appeal.employeeId,
      employee_name: appeal.employeeName,
      type: appeal.type,
      reason: appeal.reason,
      message: appeal.message,
      status: appeal.status,
      date: appeal.date,
      appeal_date: appeal.appealDate,
      related_id: appeal.relatedId
    }).select();
    
    if (error) throw error;
    return data[0];
  },
  update: async (id: string, appeal: Partial<Appeal>) => {
    const { data, error } = await supabase.from('appeals').update({
      status: appeal.status
    }).eq('id', id).select();
    
    if (error) throw error;
    return data[0];
  }
};

// Settings API
export const settingsAPI = {
  get: async () => {
    const { data, error } = await supabase.from('settings').select('*').single();
    if (error) throw error;
    return data;
  },
  update: async (settings: any) => {
    const { data, error } = await supabase.from('settings').update(settings).eq('id', 'settings').select();
    if (error) throw error;
    return data[0];
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    if (error) throw error;
    return data;
  }
};