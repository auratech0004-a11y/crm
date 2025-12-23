import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { storage } from '@/lib/store';
import { Employee } from '@/types';
import { Moon, Sun, Shield, Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'attendance', label: 'Attendance', icon: 'Clock' },
  { id: 'leave', label: 'Leave', icon: 'Calendar' },
  { id: 'payroll', label: 'Payroll', icon: 'DollarSign' },
  { id: 'expense', label: 'Expenses', icon: 'Receipt' },
];

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    setEmployees(storage.getEmployees().filter(e => e.role === 'EMPLOYEE'));
  }, []);

  const toggleModule = (moduleId: string) => {
    if (!selectedEmp) return;
    
    const allEmps = storage.getEmployees();
    const current = selectedEmp.allowedModules || [];
    const updated = current.includes(moduleId)
      ? current.filter(m => m !== moduleId)
      : [...current, moduleId];
    
    const newEmp = { ...selectedEmp, allowedModules: updated };
    const newAll = allEmps.map(e => e.id === selectedEmp.id ? newEmp : e);
    
    storage.setEmployees(newAll);
    setSelectedEmp(newEmp);
    setEmployees(newAll.filter(e => e.role === 'EMPLOYEE'));
    storage.addLog('Permissions', `Updated modules for ${selectedEmp.name}`, user?.name || 'Admin');
  };

  const handlePasswordChange = () => {
    if (newPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    const allEmps = storage.getEmployees();
    const updated = allEmps.map(e => e.id === user?.id ? { ...e, password: newPassword } : e);
    storage.setEmployees(updated);
    storage.addLog('Security', 'Admin password changed', user?.name || 'Admin');
    setNewPassword('');
    toast.success('Password changed successfully');
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
        <p className="text-muted-foreground mt-1">System configuration and permissions</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-card">
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-6 h-6 text-primary" /> : <Sun className="w-6 h-6 text-warning" />}
            Appearance
          </h3>
          <div className="flex items-center justify-between p-4 bg-secondary rounded-2xl">
            <div>
              <p className="font-bold text-foreground">Theme Mode</p>
              <p className="text-sm text-muted-foreground">Toggle between light and dark</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-16 h-8 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-secondary border-2 border-border'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full transition-all flex items-center justify-center ${
                theme === 'dark' 
                  ? 'right-1 bg-primary-foreground' 
                  : 'left-1 bg-warning'
              }`}>
                {theme === 'dark' ? <Moon className="w-3 h-3 text-primary" /> : <Sun className="w-3 h-3 text-warning-foreground" />}
              </div>
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-card">
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Lock className="w-6 h-6 text-destructive" />
            Security
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-secondary border-0 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              onClick={handlePasswordChange}
              className="w-full py-3 gradient-primary text-primary-foreground font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-card">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
          <Shield className="w-6 h-6 text-accent" />
          Employee Permissions
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(emp => (
            <button
              key={emp.id}
              onClick={() => { setSelectedEmp(emp); setPermissionModalOpen(true); }}
              className="p-4 bg-secondary rounded-2xl hover:bg-secondary/80 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-foreground">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">{emp.allowedModules?.length || 0} modules</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {permissionModalOpen && selectedEmp && (
        <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border animate-scale-in">
            <div className="p-6 border-b border-border flex justify-between items-center bg-secondary">
              <div>
                <h3 className="text-xl font-bold text-foreground">Manage Access</h3>
                <p className="text-xs text-muted-foreground mt-1">Modules for <strong>{selectedEmp.name}</strong></p>
              </div>
              <button onClick={() => setPermissionModalOpen(false)} className="text-muted-foreground hover:text-foreground text-2xl p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {AVAILABLE_MODULES.map(mod => {
                const isAllowed = selectedEmp.allowedModules?.includes(mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      isAllowed 
                        ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10' 
                        : 'border-border bg-secondary text-muted-foreground opacity-70'
                    }`}
                  >
                    <span className="font-bold text-sm">{mod.label}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isAllowed ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`}>
                      {isAllowed && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="p-6 border-t border-border bg-secondary flex justify-end">
              <button 
                onClick={() => setPermissionModalOpen(false)}
                className="px-8 py-3 gradient-primary text-primary-foreground font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
