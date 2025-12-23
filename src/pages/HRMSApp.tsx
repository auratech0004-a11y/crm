import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import LoginPage from '@/pages/LoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import EmployeeManagement from '@/pages/admin/EmployeeManagement';
import AdminAttendance from '@/pages/admin/AdminAttendance';
import AdminLeave from '@/pages/admin/AdminLeave';
import AdminPayroll from '@/pages/admin/AdminPayroll';
import AdminAppeals from '@/pages/admin/AdminAppeals';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminLeadSettings from '@/pages/admin/AdminLeadSettings';
import EmployeeDashboard from '@/pages/employee/EmployeeDashboard';
import EmployeeAttendance from '@/pages/employee/EmployeeAttendance';
import EmployeeLeave from '@/pages/employee/EmployeeLeave';
import EmployeeSalary from '@/pages/employee/EmployeeSalary';
import EmployeeFines from '@/pages/employee/EmployeeFines';
import EmployeeProfile from '@/pages/employee/EmployeeProfile';
import EmployeeSettings from '@/pages/employee/EmployeeSettings';
import LocationCheckIn from '@/pages/employee/LocationCheckIn';
import EmployeeAppeals from '@/pages/employee/EmployeeAppeals';
import NotificationsPage from '@/pages/NotificationsPage';
import { initialSync } from '@/integrations/supabase/service';

interface AppealState {
  type?: 'Absent' | 'Late' | 'Fine' | 'Salary' | 'Other';
  date?: string;
  id?: string;
}

const HRMSApp: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [appealState, setAppealState] = useState<AppealState>({});

  useEffect(() => {
    initialSync().catch(() => {});
  }, []);

  if (!user) {
    return <LoginPage />;
  }

  const isAdmin = user.role === 'ADMIN';

  const handleAppeal = (type: 'Absent' | 'Late' | 'Fine' | 'Salary' | 'Other', date?: string, id?: string) => {
    setAppealState({ type, date, id });
    setActiveView('appeals');
  };

  const renderView = () => {
    if (isAdmin) {
      switch (activeView) {
        case 'dashboard': return <AdminDashboard onNavigate={setActiveView} />;
        case 'employees': return <EmployeeManagement />;
        case 'attendance': return <AdminAttendance />;
        case 'leave': return <AdminLeave />;
        case 'payroll': return <AdminPayroll />;
        case 'appeals': return <AdminAppeals />;
        case 'settings': return <AdminSettings />;
        case 'lead': return <AdminLeadSettings />;
        case 'notifications': return <NotificationsPage />;
        default: return <AdminDashboard onNavigate={setActiveView} />;
      }
    } else {
      switch (activeView) {
        case 'dashboard': return <EmployeeDashboard user={user} onNavigate={setActiveView} />;
        case 'attendance': return (
          <EmployeeAttendance 
            user={user} 
            onCheckIn={() => setActiveView('location-checkin')} 
            onAppeal={(type, date, id) => handleAppeal(type, date, id)}
          />
        );
        case 'leave': return <EmployeeLeave user={user} />;
        case 'salary': return <EmployeeSalary user={user} />;
        case 'fines': return <EmployeeFines user={user} onAppeal={(id) => handleAppeal('Fine', undefined, id)} />;
        case 'settings': return <EmployeeSettings />;
        case 'location-checkin': return <LocationCheckIn user={user} onComplete={() => setActiveView('attendance')} onCancel={() => setActiveView('dashboard')} />;
        case 'notifications': return <NotificationsPage />;
        case 'profile': return <EmployeeProfile />;
        case 'appeals': return (
          <EmployeeAppeals 
            user={user} 
            onBack={() => { setActiveView('dashboard'); setAppealState({}); }}
            preselectedType={appealState.type}
            preselectedDate={appealState.date}
            preselectedId={appealState.id}
          />
        );
        default: return <EmployeeDashboard user={user} onNavigate={setActiveView} />;
      }
    }
  };

  return (
    <MainLayout activeView={activeView} onNavigate={setActiveView}>
      {renderView()}
    </MainLayout>
  );
};

export default HRMSApp;
