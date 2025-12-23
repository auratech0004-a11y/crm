import React, { useState, useEffect } from 'react';
import { dashboardAPI, payrollAPI, fineAPI, leaveAPI, attendanceAPI } from '../../lib/api';
import { CheckCircle, XCircle, Calendar, DollarSign, Clock, Wallet, CalendarCheck, Info } from 'lucide-react';

const EmployeeDashboard = ({ user, onNavigate }) => {
  const [stats, setStats] = useState({
    presentDays: 0,
    absentDays: 0,
    leaveBalance: 12,
    pendingLeaves: 0,
    lastSalary: 0,
    totalFines: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user.id]);

  const loadStats = async () => {
    try {
      const [attendance, leaves, fines, payrollStatus] = await Promise.all([
        attendanceAPI.getAll({ employee_id: user.id }),
        leaveAPI.getAll({ employee_id: user.id }),
        fineAPI.getAll({ employee_id: user.id }),
        payrollAPI.getStatus(),
      ]);

      const currentMonth = new Date().getMonth();
      const monthAttendance = attendance.filter((a) => {
        const aMonth = new Date(a.date).getMonth();
        return aMonth === currentMonth;
      });

      const presentDays = monthAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
      const workingDays = new Date().getDate();
      const absentDays = workingDays - presentDays;
      const pendingLeaves = leaves.filter((l) => l.status === 'Pending').length;
      const totalFines = fines.filter((f) => f.status === 'Unpaid').reduce((sum, f) => sum + f.amount, 0);
      const isPaid = payrollStatus[user.id] === 'Paid';

      setStats({
        presentDays,
        absentDays: absentDays > 0 ? absentDays : 0,
        leaveBalance: 12,
        pendingLeaves,
        lastSalary: isPaid ? user.salary : 0,
        totalFines,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Present Days', value: stats.presentDays, sub: 'This month', icon: CheckCircle, color: 'bg-success/10 text-success' },
    { label: 'Absent Days', value: stats.absentDays, sub: 'This month', icon: XCircle, color: 'bg-destructive/10 text-destructive' },
    { label: 'Leave Balance', value: stats.leaveBalance, sub: `${stats.pendingLeaves} pending`, icon: Calendar, color: 'bg-warning/10 text-warning' },
    { label: 'Last Salary', value: `₨ ${stats.lastSalary.toLocaleString()}`, sub: stats.lastSalary > 0 ? 'Disbursed' : 'Not disbursed', icon: DollarSign, color: 'bg-primary/10 text-primary' },
  ];

  const actions = [
    { icon: CalendarCheck, label: 'Apply for Leave', sub: 'Request time off from your balance', btnLabel: 'Apply Now', color: 'warning', onClick: () => onNavigate('leave') },
    { icon: Clock, label: 'My Attendance', sub: 'History & location reports', btnLabel: 'View Details', color: 'primary', onClick: () => onNavigate('attendance') },
    { icon: Wallet, label: 'Salary Details', sub: 'View monthly payslips & bonuses', btnLabel: 'View Salary', color: 'success', onClick: () => onNavigate('salary') },
  ];

  const leaveSummary = [
    { label: 'Bereavement', value: '5.00' },
    { label: 'Annual', value: '7.00' },
    { label: 'Sick Leave', value: '3.00' },
    { label: 'Wedding', value: '7.00' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up pb-10" data-testid="employee-dashboard">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-foreground">Welcome, {user.name}!</h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Empower your workspace journey</p>
        </div>
        <div className="hidden sm:block">
          <div className="text-xs bg-primary/10 text-primary px-4 py-2 rounded-full font-bold uppercase tracking-widest border border-primary/20">
            Personal ESS
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-3xl shadow-card relative overflow-hidden group" data-testid={`employee-stat-${i}`}>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-4xl font-black mt-2 text-foreground">{stat.value}</p>
              </div>
              <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 duration-300 shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className={`text-[10px] mt-6 font-bold uppercase tracking-widest ${stat.color.split(' ')[1]}`}>{stat.sub}</p>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-foreground opacity-[0.03] rounded-full scale-150" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((action, i) => {
          const colorClasses = {
            warning: 'bg-warning hover:bg-warning/90 shadow-warning/20',
            primary: 'bg-primary hover:bg-primary/90 shadow-primary/20',
            success: 'bg-success hover:bg-success/90 shadow-success/20',
          };
          const bgClasses = {
            warning: 'bg-warning',
            primary: 'bg-primary',
            success: 'bg-success',
          };

          return (
            <div key={i} className="bg-card border border-border p-8 rounded-3xl flex flex-col items-center text-center shadow-card group">
              <div className={`w-16 h-16 ${bgClasses[action.color]} rounded-2xl flex items-center justify-center text-primary-foreground mb-6 shadow-2xl transition-all group-hover:-translate-y-2 duration-300`}>
                <action.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-foreground">{action.label}</h3>
              <p className="text-muted-foreground text-sm mt-2 mb-8 font-medium leading-relaxed">{action.sub}</p>
              <button
                onClick={action.onClick}
                className={`w-full py-4 ${colorClasses[action.color]} text-primary-foreground font-bold rounded-2xl transition-all active:scale-95 shadow-lg`}
                data-testid={`action-${action.color}`}
              >
                {action.btnLabel}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-card">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg text-foreground">Leave Summary</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border">
          {leaveSummary.map((item, i) => (
            <div key={i} className="bg-card p-6 flex flex-col gap-2">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{item.label}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-foreground">{item.value}</span>
                <Calendar className="w-5 h-5 text-primary opacity-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
