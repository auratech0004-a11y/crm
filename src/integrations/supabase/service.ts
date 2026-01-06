import { storage } from '@/lib/store';
import type { Employee, Leave, Appeal, Attendance, Fine } from '@/types';

// Helper to log and gracefully fallback to local storage
function handleError<T>(ctx: string, error: any, fallback: T): T {
  console.error(`[Supabase:${ctx}]`, error);
  return fallback;
}

// Employees
export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const employees = storage.getEmployees();
    return employees;
  } catch (e) {
    return handleError('fetchEmployees', e, storage.getEmployees());
  }
}

export async function upsertEmployee(emp: Employee): Promise<Employee | null> {
  try {
    const all = storage.getEmployees();
    const exists = all.some(e => e.id === emp.id);
    const updated = exists 
      ? all.map(e => e.id === emp.id ? emp : e) 
      : [...all, emp];
    storage.setEmployees(updated);
    return emp;
  } catch (e) {
    handleError('upsertEmployee', e, null);
    return null;
  }
}

export async function deleteEmployee(id: string): Promise<boolean> {
  try {
    const all = storage.getEmployees();
    const remaining = all.filter(e => e.id !== id);
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
    const leaves = storage.getLeaves();
    return leaves;
  } catch (e) {
    return handleError('fetchLeaves', e, storage.getLeaves());
  }
}

export async function addLeave(leave: Leave): Promise<Leave | null> {
  try {
    const all = storage.getLeaves();
    const updated = [leave, ...all];
    storage.setLeaves(updated);
    return leave;
  } catch (e) {
    handleError('addLeave', e, null);
    return null;
  }
}

export async function updateLeaveStatus(leaveId: string, status: 'Approved' | 'Rejected'): Promise<boolean> {
  try {
    const all = storage.getLeaves();
    const updated = all.map(l => l.id === leaveId ? { ...l, status } : l);
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
    const appeals = storage.getAppeals();
    return appeals;
  } catch (e) {
    return handleError('fetchAppeals', e, storage.getAppeals());
  }
}

export async function addAppeal(appeal: Appeal): Promise<Appeal | null> {
  try {
    const all = storage.getAppeals();
    const updated = [appeal, ...all];
    storage.setAppeals(updated);
    return appeal;
  } catch (e) {
    handleError('addAppeal', e, null);
    return null;
  }
}

export async function updateAppealStatus(appealId: string, status: 'Approved' | 'Rejected'): Promise<boolean> {
  try {
    const all = storage.getAppeals();
    const updated = all.map(a => a.id === appealId ? { ...a, status } : a);
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
    const attendance = storage.getAttendance();
    return attendance;
  } catch (e) {
    return handleError('fetchAttendance', e, storage.getAttendance());
  }
}

export async function upsertAttendance(record: Attendance): Promise<Attendance | null> {
  try {
    const all = storage.getAttendance();
    const exists = all.some(a => a.id === record.id);
    const updated = exists 
      ? all.map(a => a.id === record.id ? record : a) 
      : [...all, record];
    storage.setAttendance(updated);
    return record;
  } catch (e) {
    handleError('upsertAttendance', e, null);
    return null;
  }
}

export async function markAttendanceStatus(employeeId: string, date: string, partial: Partial<Attendance>): Promise<boolean> {
  try {
    const all = storage.getAttendance();
    const existing = all.find(a => a.employeeId === employeeId && a.date === date);
    
    if (existing) {
      const updated = all.map(a => 
        a.employeeId === employeeId && a.date === date 
          ? { ...a, ...partial } 
          : a
      );
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

// Fines
export async function fetchFines(): Promise<Fine[]> {
  try {
    const fines = storage.getFines();
    return fines;
  } catch (e) {
    return handleError('fetchFines', e, storage.getFines());
  }
}

export async function updateFineStatus(fineId: string, status: 'Paid' | 'Unpaid'): Promise<boolean> {
  try {
    const all = storage.getFines();
    const updated = all.map(f => f.id === fineId ? { ...f, status } : f);
    storage.setFines(updated);
    return true;
  } catch (e) {
    handleError('updateFineStatus', e, false);
    return false;
  }
}

// Initial sync helpers
// Lead permissions (persisted per-lead)
const LEAD_PERMS_KEY = 'hrms_lead_permissions';
type LeadPermissions = { leadId: string; modules: string[] };

export async function fetchLeadPermissions(leadId: string): Promise<LeadPermissions | null> {
  try {
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
    const cache = JSON.parse(localStorage.getItem(LEAD_PERMS_KEY) || '{}');
    cache[leadId] = modules;
    localStorage.setItem(LEAD_PERMS_KEY, JSON.stringify(cache));
    return true;
  } catch (e) {
    // ignore, we'll still update local cache
    const cache = JSON.parse(localStorage.getItem(LEAD_PERMS_KEY) || '{}');
    cache[leadId] = modules;
    localStorage.setItem(LEAD_PERMS_KEY, JSON.stringify(cache));
    return true;
  }
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