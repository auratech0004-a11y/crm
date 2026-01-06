import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Users, User, Lock, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!login(username, password)) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-2xl shadow-foreground/5 overflow-hidden border border-border animate-scale-in">
        <div className="gradient-primary p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Users className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-foreground/20 backdrop-blur rounded-2xl mb-4">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-extrabold text-primary-foreground">A.R HRMS</h2>
            <p className="text-primary-foreground/80 mt-2">Professional HR & Admin CRM</p>
          </div>
        </div>
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm border border-destructive/20 flex items-center gap-3 animate-slide-up">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-secondary border-0 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
                placeholder="Enter username"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-secondary border-0 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
                placeholder="Enter password"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-4 gradient-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/30"
          >
            Login to Workspace
          </button>
          <div className="text-center text-sm text-muted-foreground">
            <p>Demo accounts:</p>
            <p className="mt-1"><strong>Admin:</strong> admin / 123</p>
            <p><strong>Employee:</strong> babar / 12345678</p>
            <p><strong>Employee:</strong> sara / 12345678</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;