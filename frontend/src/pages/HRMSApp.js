import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import LoginPage from './LoginPage';
import AdminDashboard from './admin/AdminDashboard';
import EmployeeManagement from './admin/EmployeeManagement';
import AdminAttendance from './admin/AdminAttendance';
import AdminLeave from './admin/AdminLeave';
import AdminPayroll from './admin/AdminPayroll';
import AdminFines from './admin/AdminFines';
import AdminAppeals from './admin/AdminAppeals';
import AdminSettings from './admin/AdminSettings';
import AdminLeadSettings from './admin/AdminLeadSettings';
import EmployeeDashboard from './employee/EmployeeDashboard';
import EmployeeAttendance from './employee/EmployeeAttendance';
import EmployeeLeave from './employee/EmployeeLeave';
import EmployeeSalary from './employee/EmployeeSalary';
import EmployeeFines from './employee/EmployeeFines';
import EmployeeSettings from './employee/EmployeeSettings';
import EmployeeAppeals from './employee/EmployeeAppeals';

const HRMSApp = () => {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [appealState, setAppealState] = useState({});

  useEffect(() => {
    setActiveView('dashboard');
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const isAdmin = user.role === 'ADMIN';

  const handleAppeal = (type, date, id) => {
    setAppealState({ type, date, id });
    setActiveView('appeals');
  };

  const renderView = () => {
    if (isAdmin) {
      switch (activeView) {
        case 'dashboard':
          return <AdminDashboard onNavigate={setActiveView} />;
        case 'employees':
          return <EmployeeManagement />;
        case 'attendance':
          return <AdminAttendance />;
        case 'leave':
          return <AdminLeave />;
        case 'fines':
          return <AdminFines />;
        case 'payroll':
          return <AdminPayroll />;
        case 'appeals':
          return <AdminAppeals />;
        case 'settings':
          return <AdminSettings />;
        case 'lead':
          return <AdminLeadSettings />;
        default:
          return <AdminDashboard onNavigate={setActiveView} />;
      }
    } else {
      switch (activeView) {
        case 'dashboard':
          return <EmployeeDashboard user={user} onNavigate={setActiveView} />;
        case 'attendance':
          return (
            <EmployeeAttendance
              user={user}
              onAppeal={(type, date, id) => handleAppeal(type, date, id)}
            />
          );
        case 'leave':
          return <EmployeeLeave user={user} />;
        case 'salary':
          return <EmployeeSalary user={user} />;
        case 'fines':
          return <EmployeeFines user={user} onAppeal={(id) => handleAppeal('Fine', undefined, id)} />;
        case 'settings':
          return <EmployeeSettings />;
        case 'appeals':
          return (
            <EmployeeAppeals
              user={user}
              onBack={() => {
                setActiveView('dashboard');
                setAppealState({});
              }}
              preselectedType={appealState.type}
              preselectedDate={appealState.date}
              preselectedId={appealState.id}
            />
          );
        default:
          return <EmployeeDashboard user={user} onNavigate={setActiveView} />;
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
