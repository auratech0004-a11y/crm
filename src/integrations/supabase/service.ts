import { supabase } from './client';
import { storage } from '@/lib/store';
import type { Employee, Leave, Appeal, Attendance } from '@/types';

// Helper to log and gracefully fallback to local storage
function handleError<T>(ctx: string, error: any, fallback: T): T {
  console.error(`[Supabase:${ctx}]`, error);
  return fallback;
}

// Employees
export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const { data, error } = await supabase.from('employees').select('*');
    if (error) throw error;
    const employees = (data as unknown as Employee[]) || [];
    // Cache to local for offline use
    storage.setEmployees(employees);
    return employees;
  } catch (e) {
    return handleError('fetchEmployees', e, storage.getEmployees());
  }
}

export async function upsertEmployee(emp: Employee): Promise<Employee | null> {
  try {
    const { data, error } = await supabase.from('employees').upsert(emp).select('*').single();
    if (error) throw error;
    const updated = (data as unknown as Employee);
    // Update local cache
    const all = storage.getEmployees();
    const exists = all.some(e => e.id === updated.id);
    storage.setEmployees(exists ? all.map(e => e.id === updated.id ? updated : e) : [...all, updated]);
    return updated;
  } catch (e) {
    handleError('upsertEmployee', e, null);
    return null;
  }
}

export async function deleteEmployee(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
    // Update local cache
    const remaining = storage.getEmployees().filter(e => e.id !== id);
    storage.setEmployees(remaining);
    return true;
  } catch (e) {
    handleError('deleteEmployee', e, false);
    return false;
  }
}

// Leaves
export async function fetchLeaves(): Promise<Leave[]> {
  try {
    const { data, error } = await supabase.from('leaves').select('*').order('requestDate', { ascending: false });
    if (error) throw error;
    const leaves = (data as unknown as Leave[]) || [];
    storage.setLeaves(leaves);
    return leaves;
  } catch (e) {
    return handleError('fetchLeaves', e, storage.getLeaves());
  }
}

export async function addLeave(leave: Leave): Promise<Leave | null> {
  try {
    const { data, error } = await supabase.from('leaves').insert(leave).select('*').single();
    if (error) throw error;
    const saved = (data as unknown as Leave);
    storage.setLeaves([saved, ...storage.getLeaves()]);
    return saved;
  } catch (e) {
    handleError('addLeave', e, null);
    return null;
  }
}

export async function updateLeaveStatus(leaveId: string, status: 'Approved' | 'Rejected'): Promise<boolean> {
  try {
    const { error } = await supabase.from('leaves').update({ status }).eq('id', leaveId);
    if (error) throw error;
    const updated = storage.getLeaves().map(l => l.id === leaveId ? { ...l, status } : l);
    storage.setLeaves(updated);
    return true;
  } catch (e) {
    handleError('updateLeaveStatus', e, false);
    return false;
  }
}

// Appeals (Absent / Late requests)
export async function fetchAppeals(): Promise<Appeal[]> {
  try {
    const { data, error } = await supabase.from('appeals').select('*').order('appealDate', { ascending: false });
    if (error) throw error;
    const appeals = (data as unknown as Appeal[]) || [];
    storage.setAppeals(appeals);
    return appeals;
  } catch (e) {
    return handleError('fetchAppeals', e, storage.getAppeals());
  }
}

export async function addAppeal(appeal: Appeal): Promise<Appeal | null> {
  try {
    const { data, error } = await supabase.from('appeals').insert(appeal).select('*').single();
    if (error) throw error;
    const saved = (data as unknown as Appeal);
    storage.setAppeals([saved, ...storage.getAppeals()]);
    return saved;
  } catch (e) {
    handleError('addAppeal', e, null);
    return null;
  }
}

export async function updateAppealStatus(appealId: string, status: 'Approved' | 'Rejected'): Promise<boolean> {
  try {
    const { error } = await supabase.from('appeals').update({ status }).eq('id', appealId);
    if (error) throw error;
    const updated = storage.getAppeals().map(a => a.id === appealId ? { ...a, status } : a);
    storage.setAppeals(updated);
    return true;
  } catch (e) {
    handleError('updateAppealStatus', e, false);
    return false;
  }
}

// Attendance
export async function fetchAttendance(): Promise<Attendance[]> {
  try {
    const { data, error } = await supabase.from('attendance').select('*');
    if (error) throw error;
    const attendance = (data as unknown as Attendance[]) || [];
    storage.setAttendance(attendance);
    return attendance;
  } catch (e) {
    return handleError('fetchAttendance', e, storage.getAttendance());
  }
}

export async function upsertAttendance(record: Attendance): Promise<Attendance | null> {
  try {
    const { data, error } = await supabase.from('attendance').upsert(record).select('*').single();
    if (error) throw error;
    const saved = (data as unknown as Attendance);
    const all = storage.getAttendance();
    const exists = all.some(a => a.id === saved.id);
    storage.setAttendance(exists ? all.map(a => a.id === saved.id ? saved : a) : [...all, saved]);
    return saved;
  } catch (e) {
    handleError('upsertAttendance', e, null);
    return null;
  }
}

export async function markAttendanceStatus(employeeId: string, date: string, partial: Partial<Attendance>): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employeeId', employeeId)
      .eq('date', date)
      .maybeSingle();
    if (error) throw error;

    if (data) {
      const { error: upErr } = await supabase.from('attendance').update(partial).eq('id', (data as any).id);
      if (upErr) throw upErr;
      const updated = storage.getAttendance().map(a => a.employeeId === employeeId && a.date === date ? { ...a, ...partial } : a);
      storage.setAttendance(updated);
    } else {
      const newRec: Attendance = {
        id: Math.random().toString(36).substr(2, 9),
        employeeId,
        date,
        status: partial.status || 'Present',
        method: partial.method || 'Manual',
        checkIn: partial.checkIn,
        checkOut: partial.checkOut
      } as Attendance;
      await upsertAttendance(newRec);
    }
    return true;
  } catch (e) {
    handleError('markAttendanceStatus', e, false);
    return false;
  }
}

// Initial sync helpers
// Lead permissions (persisted per-lead)
const LEAD_PERMS_KEY = 'hrms_lead_permissions';

type LeadPermissions = { leadId: string; modules: string[] };

export async function fetchLeadPermissions(leadId: string): Promise<LeadPermissions | null> {
  try {
    const { data, error } = await supabase.from('app_lead_permissions').select('*').eq('leadId', leadId).maybeSingle();
    if (error) throw error;
    if (data) {
      const lp = data as any as LeadPermissions;
      const cache = JSON.parse(localStorage.getItem(LEAD_PERMS_KEY) || '{}');
      cache[leadId] = lp.modules;
      localStorage.setItem(LEAD_PERMS_KEY, JSON.stringify(cache));
      return lp;
    }
    // Fallback to local cache
    const cache = JSON.parse(localStorage.getItem(LEAD_PERMS_KEY) || '{}');
    if (cache[leadId]) return { leadId, modules: cache[leadId] };
    return null;
  } catch (e) {
    const cache = JSON.parse(localStorage.getItem(LEAD_PERMS_KEY) || '{}');
    if (cache[leadId]) return { leadId, modules: cache[leadId] };
    return null;
  }
}

export async function upsertLeadPermissions(leadId: string, modules: string[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('app_lead_permissions')
      .upsert({ leadId, modules }, { onConflict: 'leadId' });
    if (error) throw error;
  } catch (e) {
    // ignore, we'll still update local cache
  }
  const cache = JSON.parse(localStorage.getItem(LEAD_PERMS_KEY) || '{}');
  cache[leadId] = modules;
  localStorage.setItem(LEAD_PERMS_KEY, JSON.stringify(cache));
  return true;
}

export async function initialSync() {
  // Best-effort parallel sync
  await Promise.allSettled([
    fetchEmployees(),
    fetchLeaves(),
    fetchAppeals(),
    fetchAttendance(),
  ]);
}
