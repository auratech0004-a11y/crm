import React from 'react';
import { LayoutDashboard, Bell, CalendarMinus, Clock, Settings, User, Plus } from 'lucide-react';

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'notifications', label: 'Notify', icon: Bell },
    { id: 'leave', label: 'Leave', icon: CalendarMinus },
    { id: 'attendance', label: 'History', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.1)] z-40 flex items-center justify-between px-2 py-3 lg:hidden">
      {navItems.slice(0, 3).map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className="flex-1 flex flex-col items-center gap-1 transition-all active:scale-95"
        >
          <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-accent' : 'text-muted-foreground'}`} />
          <span className={`text-[10px] font-bold uppercase tracking-tight ${activeView === item.id ? 'text-accent' : 'text-muted-foreground'}`}>
            {item.label}
          </span>
        </button>
      ))}

      <div className="relative -top-7 flex flex-col items-center">
        <button 
          onClick={() => onNavigate('location-checkin')}
          className="w-14 h-14 gradient-primary rounded-full flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/30 active:scale-90 transition-transform border-4 border-card"
        >
          <Plus className="w-7 h-7" />
        </button>
        <span className="text-[10px] font-bold mt-1 text-accent uppercase tracking-tighter">Check-in</span>
      </div>

      {navItems.slice(3).map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className="flex-1 flex flex-col items-center gap-1 transition-all active:scale-95"
        >
          <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-accent' : 'text-muted-foreground'}`} />
          <span className={`text-[10px] font-bold uppercase tracking-tight ${activeView === item.id ? 'text-accent' : 'text-muted-foreground'}`}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
