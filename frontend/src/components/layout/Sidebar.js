import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, LayoutDashboard, Clock, CalendarCheck, DollarSign, AlertCircle, Settings, LogOut, AlertTriangle } from 'lucide-react';

const Sidebar = ({ activeView, onNavigate, isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const adminLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave Management', icon: CalendarCheck },
    { id: 'fines', label: 'Fines', icon: AlertTriangle },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'appeals', label: 'Appeals', icon: AlertCircle },
    { id: 'lead', label: 'Lead Settings', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const employeeLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'My Attendance', icon: Clock },
    { id: 'leave', label: 'Leave Requests', icon: CalendarCheck },
    { id: 'salary', label: 'Salary Details', icon: DollarSign },
    { id: 'fines', label: 'My Fines', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  const handleNavigate = (view) => {
    onNavigate(view);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} data-testid="sidebar">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 flex items-center justify-center gradient-primary rounded-xl shadow-lg shadow-primary/20">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-none text-foreground">CRM A.R HRMS</h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                {isAdmin ? 'Admin Portal' : 'Employee Portal'}
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavigate(link.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  activeView === link.id
                    ? 'gradient-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
                data-testid={`nav-${link.id}`}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-semibold text-sm">{link.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-6 mt-6 border-t border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-foreground">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate uppercase font-bold">
                  {isAdmin ? 'Administrator' : user?.designation}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 text-destructive hover:text-destructive/80 font-bold transition-colors"
              data-testid="logout-btn"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
