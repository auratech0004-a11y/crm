import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, Bell, AlertCircle } from 'lucide-react';

interface HeaderProps {
  activeView: string;
  onMenuClick: () => void;
  onNotificationClick?: () => void;
  onAppealsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, onMenuClick, onNotificationClick, onAppealsClick }) => {
  const { user } = useAuth();

  const formatViewName = (view: string) => {
    return view.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const isAdmin = user?.role === 'ADMIN';
  const appealsLabel = isAdmin ? 'Absent Requests' : 'Absent Request';

  return (
    <>
      {/* Mobile Header */}
      <header className="gradient-primary h-14 lg:hidden flex items-center justify-between px-4 sticky top-0 z-30 shadow-lg">
        <button 
          onClick={onMenuClick} 
          className="p-2 active:bg-primary-foreground/10 rounded-full transition-colors text-primary-foreground"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg capitalize text-primary-foreground">
          {formatViewName(activeView)}
        </h1>
        <div className="flex items-center gap-2">
          {onAppealsClick && (
            <button 
              onClick={onAppealsClick}
              className="p-2 active:bg-primary-foreground/10 rounded-full transition-colors text-primary-foreground"
              title={appealsLabel}
            >
              <AlertCircle className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={onNotificationClick}
            className="p-2 active:bg-primary-foreground/10 rounded-full transition-colors text-primary-foreground relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
              2
            </span>
          </button>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:flex h-16 border-b border-border items-center justify-between px-8 bg-card backdrop-blur z-20">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-xl capitalize text-foreground">
            {formatViewName(activeView)}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {onAppealsClick && (
            <button 
              onClick={onAppealsClick}
              className="px-3 py-2 text-sm font-bold rounded-xl border border-border hover:bg-secondary transition-colors flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{appealsLabel}</span>
            </button>
          )}
          <button 
            onClick={onNotificationClick}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
              2
            </span>
          </button>
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
            {user?.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
