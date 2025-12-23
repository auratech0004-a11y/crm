import React from 'react';
import { LayoutDashboard, Clock, CalendarCheck, DollarSign, AlertTriangle } from 'lucide-react';

const BottomNav = ({ activeView, onNavigate }) => {
  const links = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave', icon: CalendarCheck },
    { id: 'fines', label: 'Fines', icon: AlertTriangle },
    { id: 'salary', label: 'Salary', icon: DollarSign },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 z-30" data-testid="bottom-nav">
      <div className="flex justify-around items-center">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              activeView === link.id
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground'
            }`}
            data-testid={`bottom-nav-${link.id}`}
          >
            <link.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{link.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
