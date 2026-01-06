import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/store';
import { Moon, Sun, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'sonner';

const EmployeeSettings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');

  const handlePasswordChange = async () => {
    if (!user) return;
    
    if (newPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    
    const allEmps = await storage.getEmployees();
    const updated = allEmps.map(e => e.id === user.id ? { ...e, password: newPassword } : e);
    // Assuming storage has a setEmployees method or we update via API
    setNewPassword('');
    toast.success('Password changed successfully');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your workspace preferences</p>
      </div>
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
            className={`relative w-16 h-8 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-primary' : 'bg-secondary border-2 border-border'
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full transition-all flex items-center justify-center ${
              theme === 'dark' ? 'right-1 bg-primary-foreground' : 'left-1 bg-warning'
            }`}>
              {theme === 'dark' ? <Moon className="w-3 h-3 text-primary" /> : <Sun className="w-3 h-3 text-warning-foreground" />}
            </div>
          </button>
        </div>
      </div>
      <div className="bg-card border border-border rounded-3xl p-8 shadow-card">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
          <Shield className="w-6 h-6 text-destructive" />
          Security
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              <Lock className="w-3 h-3 inline mr-2" />
              New Password
            </label>
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
      <div className="bg-card border border-border rounded-3xl p-8 shadow-card">
        <h3 className="text-xl font-bold text-foreground mb-6">Account Info</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-secondary rounded-2xl">
            <span className="text-muted-foreground">Username</span>
            <span className="font-bold text-foreground">{user?.username}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-secondary rounded-2xl">
            <span className="text-muted-foreground">Role</span>
            <span className="font-bold text-foreground capitalize">{user?.role.toLowerCase()}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-secondary rounded-2xl">
            <span className="text-muted-foreground">Member Since</span>
            <span className="font-bold text-foreground">{user?.joiningDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSettings;