import React from 'react';
import { storage } from '@/lib/store';
import { Users, UserCheck, UserX, Calendar, History, UserPlus, ClipboardList, CalendarCheck, Calculator } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = React.useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    onLeave: 0
  });

  React.useEffect(() => {
    const loadData = async () => {
      const employees = await storage.getEmployees();
      const attendance = await storage.getAttendance();
      const leaves = await storage.getLeaves();
      
      const today = new Date().toISOString().split('T')[0];
      const totalEmployees = employees.filter(e => e.role === 'EMPLOYEE').length;
      const presentToday = attendance.filter(a => a.date === today && a.status === 'Present').length;
      const absentToday = totalEmployees - presentToday;
      const onLeave = leaves.filter(l => l.status === 'Approved' && l.startDate <= today && l.endDate >= today).length;
      
      setStats({
        totalEmployees,
        presentToday,
        absentToday,
        onLeave
      });
    };
    
    loadData();
  }, []);

  const statsData = [
    { 
      label: 'Total Employees', 
      value: stats.totalEmployees, 
      subValue: `${stats.totalEmployees} active`, 
      icon: Users, 
      color: 'bg-primary' 
    },
    { 
      label: 'Present Today', 
      value: stats.presentToday, 
      subValue: `${stats.totalEmployees > 0 ? Math.round((stats.presentToday / stats.totalEmployees) * 100) : 0}% attendance`, 
      icon: UserCheck, 
      color: 'bg-success' 
    },
    { 
      label: 'Absent Today', 
      value: stats.absentToday, 
      subValue: 'Requires attention', 
      icon: UserX, 
      color: 'bg-destructive' 
    },
    { 
      label: 'On Leave', 
      value: stats.onLeave, 
      subValue: `${(async () => {
        const leaves = await storage.getLeaves();
        return leaves.filter(l => l.status === 'Pending').length;
      })()} pending`, 
      icon: Calendar, 
      color: 'bg-warning' 
    },
  ];

  const quickActions = [
    { icon: UserPlus, label: 'Add Employee', color: 'bg-primary', onClick: () => onNavigate('employees') },
    { icon: ClipboardList, label: 'View Attendance', color: 'bg-success', onClick: () => onNavigate('attendance') },
    { icon: CalendarCheck, label: 'Leave Requests', color: 'bg-warning', onClick: () => onNavigate('leave') },
    { icon: Calculator, label: 'Run Payroll', color: 'bg-destructive', onClick: () => onNavigate('payroll') },
  ];

  return (
    <div className="space-y-10 animate-slide-up">
      <div>
        <h1 className="text-4xl font-black text-foreground">Admin Overview</h1>
        <p className="text-muted-foreground mt-1 font-medium">Control center for A.R HR operations.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-8 rounded-3xl shadow-card flex justify-between group transition-all hover:-translate-y-1">
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
            Recent Activity
          </h2>
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6">
              <History className="w-8 h-8 opacity-40" />
            </div>
            <p className="font-bold italic">No recent system activity recorded today.</p>
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