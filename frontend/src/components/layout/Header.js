import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Menu, Moon, Sun, Bell } from 'lucide-react';

const Header = ({ activeView, onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      employees: 'Employee Management',
      attendance: 'Attendance',
      leave: 'Leave Management',
      fines: 'Fine Management',
      payroll: 'Payroll',
      appeals: 'Appeals',
      settings: 'Settings',
      lead: 'Lead Settings',
      salary: 'Salary Details',
    };
    return titles[activeView] || 'Dashboard';
  };

  return (
    <header className="gradient-primary text-primary-foreground px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-lg" data-testid="header">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-primary-foreground/10 rounded-xl transition-colors"
          data-testid="menu-toggle"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold">{getTitle()}</h1>
          <p className="text-xs text-primary-foreground/70 hidden sm:block">
            Welcome back, {user?.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-primary-foreground/10 rounded-xl transition-colors"
          data-testid="theme-toggle"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="p-2 hover:bg-primary-foreground/10 rounded-xl transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
        <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center font-bold text-sm">
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Header;
