import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../lib/api';
import { Users, UserCheck, UserX, Calendar, History, UserPlus, ClipboardList, CalendarCheck, Calculator } from 'lucide-react';

const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    total_employees: 0,
    present_today: 0,
    absent_today: 0,
    pending_leaves: 0,
    on_leave: 0,
    total_fines: 0,
    monthly_payroll: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardAPI.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Employees',
      value: stats.total_employees,
      subValue: `${stats.total_employees} active`,
      icon: Users,
      color: 'bg-primary',
    },
    {
      label: 'Present Today',
      value: stats.present_today,
      subValue: `${stats.total_employees > 0 ? Math.round((stats.present_today / stats.total_employees) * 100) : 0}% attendance`,
      icon: UserCheck,
      color: 'bg-success',
    },
    {
      label: 'Absent Today',
      value: stats.absent_today,
      subValue: 'Requires attention',
      icon: UserX,
      color: 'bg-destructive',
    },
    {
      label: 'On Leave',
      value: stats.on_leave,
      subValue: `${stats.pending_leaves} pending`,
      icon: Calendar,
      color: 'bg-warning',
    },
  ];

  const quickActions = [
    { icon: UserPlus, label: 'Add Employee', color: 'bg-primary', onClick: () => onNavigate('employees') },
    { icon: ClipboardList, label: 'View Attendance', color: 'bg-success', onClick: () => onNavigate('attendance') },
    { icon: CalendarCheck, label: 'Leave Requests', color: 'bg-warning', onClick: () => onNavigate('leave') },
    { icon: Calculator, label: 'Run Payroll', color: 'bg-destructive', onClick: () => onNavigate('payroll') },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-slide-up" data-testid="admin-dashboard">
      <div>
        <h1 className="text-4xl font-black text-foreground">Admin Overview</h1>
        <p className="text-muted-foreground mt-1 font-medium">Control center for A.R HR operations.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-8 rounded-3xl shadow-card flex justify-between group transition-all hover:-translate-y-1" data-testid={`stat-card-${i}`}>
            <div>
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-5xl font-black mt-4 text-foreground">{stat.value}</p>
              <p className={`text-[10px] font-bold mt-6 uppercase tracking-wider ${
                stat.color === 'bg-success' ? 'text-success' :
                stat.color === 'bg-destructive' ? 'text-destructive' :
                stat.color === 'bg-warning' ? 'text-warning' : 'text-primary'
              }`}>{stat.subValue}</p>
            </div>
            <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center text-primary-foreground shadow-2xl group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-7 h-7" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-10 flex flex-col shadow-card min-h-[400px]">
          <h2 className="text-2xl font-black mb-10 flex items-center gap-3 text-foreground">
            <History className="w-6 h-6 text-primary" />
            Summary
          </h2>
          <div className="flex-1 grid grid-cols-2 gap-6">
            <div className="bg-secondary/50 rounded-2xl p-6">
              <p className="text-muted-foreground text-sm font-bold uppercase">Monthly Payroll</p>
              <p className="text-3xl font-black text-foreground mt-2">₨ {stats.monthly_payroll.toLocaleString()}</p>
            </div>
            <div className="bg-secondary/50 rounded-2xl p-6">
              <p className="text-muted-foreground text-sm font-bold uppercase">Total Fines</p>
              <p className="text-3xl font-black text-destructive mt-2">₨ {stats.total_fines.toLocaleString()}</p>
            </div>
            <div className="bg-secondary/50 rounded-2xl p-6">
              <p className="text-muted-foreground text-sm font-bold uppercase">Pending Leaves</p>
              <p className="text-3xl font-black text-warning mt-2">{stats.pending_leaves}</p>
            </div>
            <div className="bg-secondary/50 rounded-2xl p-6">
              <p className="text-muted-foreground text-sm font-bold uppercase">Attendance Rate</p>
              <p className="text-3xl font-black text-success mt-2">
                {stats.total_employees > 0 ? Math.round((stats.present_today / stats.total_employees) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-10 shadow-card">
          <h2 className="text-2xl font-black mb-10 text-foreground">Quick Actions</h2>
          <div className="space-y-4">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className="w-full flex items-center gap-5 p-5 rounded-2xl bg-secondary/50 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                data-testid={`quick-action-${i}`}
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-primary-foreground shadow-lg`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-muted-foreground group-hover:text-foreground tracking-tight uppercase">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
