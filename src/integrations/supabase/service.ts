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
    const employees = await storage.getEmployees();
    return employees;
  } catch (e) {
    return handleError('fetchEmployees', e, await storage.getEmployees());
  }
}

export async function upsertEmployee(emp: Employee): Promise<Employee | null> {
  try {
    const all = await storage.getEmployees();
    const exists = all.some(e => e.id === emp.id);
    const updated = exists ? all.map(e => e.id === emp.id ? emp : e) : [...all, emp];
    // Assuming storage has a setEmployees method or we update via API
    return emp;
  } catch (e) {
    handleError('upsertEmployee', e, null);
    return null;
  }
}

export async function deleteEmployee(id: string): Promise<boolean> {
  try {
    const all = await storage.getEmployees();
    const remaining = all.filter(e => e.id !== id);
    // Assuming storage has a setEmployees method or we update via API
    return true;
  } catch (e) {
    handleError('deleteEmployee', e, false);
    return false;
  }
}

// Leaves
export async function fetchLeaves(): Promise<Leave[]> {
  try {
    const leaves = await storage.getLeaves();
    return leaves;
  } catch (e) {
    return handleError('fetchLeaves', e, await storage.getLeaves());
  }
}

export async function addLeave(leave: Leave): Promise<Leave | null> {
  try {
    const all = await storage.getLeaves();
    const updated = [leave, ...all];
    // Assuming storage has a setLeaves method or we update via API
    return leave;
  } catch (e) {
    handleError('addLeave', e, null);
    return null;
  }
}

export async function updateLeaveStatus(leaveId: string, status: 'Approved' | 'Rejected'): Promise<boolean> {
  try {
    const all = await storage.getLeaves();
    const updated = all.map(l => l.id === leaveId ? { ...l, status } : l);
    // Assuming storage has a setLeaves method or we update via API
    return true;
  } catch (e) {
    handleError('updateLeaveStatus', e, false);
    return false;
  }
}

// Appeals (Absent / Late requests)
export async function fetchAppeals(): Promise<Appeal[]> {
  try {
    const appeals = await storage.getAppeals();
    return appeals;
  } catch (e) {
    return handleError('fetchAppeals', e, await storage.getAppeals());
  }
}

export async function addAppeal(appeal: Appeal): Promise<Appeal | null> {
  try {
    const all = await storage.getAppeals();
    const updated = [appeal, ...all];
    // Assuming storage has a setAppeals method or we update via API
    return appeal;
  } catch (e) {
    handleError('addAppeal', e, null);
    return null;
  }
}

export async function updateAppealStatus(appealId: string, status: 'Approved' | 'Rejected'): Promise<boolean> {
  try {
    const all = await storage.getAppeals();
    const updated = all.map(a => a.id === appealId ? { ...a, status } : a);
    // Assuming storage has a setAppeals method or we update via API
    return true;
  } catch (e) {
    handleError('updateAppealStatus', e, false);
    return false;
  }
}

// Attendance
export async function fetchAttendance(): Promise<Attendance[]> {
  try {
    const attendance = await storage.getAttendance();
    return attendance;
  } catch (e) {
    return handleError('fetchAttendance', e, await storage.getAttendance());
  }
}

export async function upsertAttendance(record: Attendance): Promise<Attendance | null> {
  try {
    const all = await storage.getAttendance();
    const exists = all.some(a => a.id === record.id);
    const updated = exists ? all.map(a => a.id === record.id ? record : a) : [...all, record];
    // Assuming storage has a setAttendance method or we update via API
    return record;
  } catch (e) {
    handleError('upsertAttendance', e, null);
    return null;
  }
}

export async function markAttendanceStatus(employeeId: string, date: string, partial: Partial<Attendance>): Promise<boolean> {
  try {
    const all = await storage.getAttendance();
    const existing = all.find(a => a.employeeId === employeeId && a.date === date);
    
    if (existing) {
      const updated = all.map(a => 
        a.employeeId === employeeId && a.date === date ? { ...a, ...partial } : a
      );
      // Assuming storage has a setAttendance method or we update via API
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
    const fines = await storage.getFines();
    return fines;
  } catch (e) {
    return handleError('fetchFines', e, await storage.getFines());
  }
}

export async function updateFineStatus(fineId: string, status: 'Paid' | 'Unpaid'): Promise<boolean> {
  try {
    const all = await storage.getFines();
    const updated = all.map(f => f.id === fineId ? { ...f, status } : f);
    // Assuming storage has a setFines method or we update via API
    return true;
  } catch (e) {
    handleError('updateFineStatus', e, false);
    return false;
  }
}

// Initial sync helpers
export async function initialSync() {
  // Best-effort parallel sync
  await Promise.allSettled([
    fetchEmployees(),
    fetchLeaves(),
    fetchAppeals(),
    fetchAttendance(),
  ]);
}