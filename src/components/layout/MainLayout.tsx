import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';

interface MainLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, activeView, onNavigate }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-background text-foreground transition-colors duration-300">
      <Sidebar 
        activeView={activeView}
        onNavigate={onNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header 
          activeView={activeView}
          onMenuClick={() => setSidebarOpen(true)}
          onNotificationClick={() => onNavigate('notifications')}
          onAppealsClick={() => onNavigate('appeals')}
        />

        <main className={`flex-1 overflow-y-auto p-4 lg:p-8 bg-background ${!isAdmin ? 'pb-24' : ''}`}>
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>

        {!isAdmin && (
          <BottomNav activeView={activeView} onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
};

export default MainLayout;
