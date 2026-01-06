import React from 'react';
import { storage } from '@/lib/store';
import { MapPin } from 'lucide-react';

const AdminAttendance: React.FC = () => {
  const employees = storage.getEmployees().filter(e => e.role === 'EMPLOYEE');
  const attendance = storage.getAttendance();
  const today = new Date().toISOString().split('T')[0];

  const getRecordForEmployee = (empId: string) => {
    return attendance.find(a => a.employeeId === empId && a.date === today);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground mt-1">Real-time attendance of all employees</p>
      </div>
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary text-muted-foreground uppercase text-[10px] font-bold tracking-widest border-b border-border">
                <th className="px-8 py-5">Employee</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Check In</th>
                <th className="px-8 py-5">Location</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employees.map(emp => {
                const record = getRecordForEmployee(emp.id);
                return (
                  <tr key={emp.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-primary border border-border">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        record ? 'bg-success/10 text-success border-success/30' : 'bg-destructive/10 text-destructive border-destructive/30'
                      }`}>
                        {record ? 'Present' : 'Absent'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-foreground">{record?.checkIn || '--:--'}</p>
                    </td>
                    <td className="px-8 py-6">
                      {record?.location ? (
                        <div className="flex items-center gap-2 text-primary text-xs">
                          <MapPin className="w-4 h-4" />
                          <span>{record.location.address || 'View Map'}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No data</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-primary font-bold text-xs hover:underline">View History</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;