import React, { useState } from 'react';
import { Employee } from '@/types';
import { storage } from '@/lib/store';
import { CheckCircle, Clock, XCircle, Calendar, MapPin, LogIn, MoreVertical, AlertCircle } from 'lucide-react';

interface EmployeeAttendanceProps {
  user: Employee;
  onCheckIn: () => void;
  onAppeal: (type: 'Absent' | 'Late', date: string, id?: string) => void;
}

const EmployeeAttendance: React.FC<EmployeeAttendanceProps> = ({ user, onCheckIn, onAppeal }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const records = storage.getAttendance().filter(a => a.employeeId === user.id);
  const today = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = records.some(r => r.date === today);

  const presentDays = records.filter(r => r.status === 'Present').length;
  const absentDays = records.filter(r => r.status === 'Absent').length;
  const lateDays = records.filter(r => r.status === 'Late').length;

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-success/10 text-success border-success/20';
      case 'Absent': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Late': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-foreground">My Attendance</h1>
          <p className="text-muted-foreground mt-1 font-medium italic">View your work presence logs</p>
        </div>
      </div>

      <div className="bg-card border border-border p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-8 shadow-card">
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 ${hasCheckedInToday ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'} rounded-2xl flex items-center justify-center text-2xl`}>
            {hasCheckedInToday ? <CheckCircle className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">{hasCheckedInToday ? "Already Checked In" : "Today's Attendance"}</h2>
            <p className="text-muted-foreground text-sm font-medium">
              {hasCheckedInToday ? "You have successfully marked your presence today." : "You haven't marked your attendance yet."}
            </p>
          </div>
        </div>
        {!hasCheckedInToday && (
          <button 
            onClick={onCheckIn}
            className="w-full sm:w-auto gradient-primary text-primary-foreground px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <LogIn className="w-5 h-5" />
            MARK ATTENDANCE
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 rounded-3xl flex items-center gap-4 shadow-card">
          <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center text-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">{presentDays}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Present</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl flex items-center gap-4 shadow-card">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center text-xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">{absentDays}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Absent</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl flex items-center gap-4 shadow-card">
          <div className="w-12 h-12 bg-warning/10 text-warning rounded-xl flex items-center justify-center text-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">{lateDays}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Late</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl flex items-center gap-4 shadow-card">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">{records.length}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card min-h-[300px]">
        <table className="w-full text-left">
          <thead className="bg-secondary">
            <tr className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b border-border">
              <th className="px-6 py-5">Date</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5">Check In</th>
              <th className="px-6 py-5 hidden sm:table-cell">Location</th>
              <th className="px-6 py-5 w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground italic font-medium">No attendance records found in history</td>
              </tr>
            ) : (
              records.map(r => (
                <tr key={r.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-5 font-bold text-foreground">{r.date}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusClass(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold text-foreground">{r.checkIn || '-'}</td>
                  <td className="px-6 py-5 text-muted-foreground text-xs truncate max-w-[150px] hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      {r.location?.address || 'No location'}
                    </div>
                  </td>
                  <td className="px-6 py-5 relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                    
                    {openMenuId === r.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-6 top-12 z-20 bg-card border border-border rounded-xl shadow-lg py-2 min-w-[180px] dropdown-enter">
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              onAppeal(r.status === 'Late' ? 'Late' : 'Absent', r.date, r.id);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-foreground hover:bg-secondary flex items-center gap-2 transition-colors"
                          >
                            <AlertCircle className="w-4 h-4 text-warning" />
                            Submit Appeal
                          </button>
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              onAppeal(r.status === 'Late' ? 'Late' : 'Absent', r.date, r.id);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm font-bold text-foreground hover:bg-secondary flex items-center gap-2 transition-colors"
                          >
                            <AlertCircle className="w-4 h-4 text-warning" />
                            Appeal
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
