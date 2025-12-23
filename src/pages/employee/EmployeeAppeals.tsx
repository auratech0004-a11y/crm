import React, { useState, useEffect } from 'react';
import { Employee, Appeal, Attendance, Fine } from '@/types';
import { storage } from '@/lib/store';
import { addAppeal, fetchAppeals } from '@/integrations/supabase/service';
import { ArrowLeft, Send, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface EmployeeAppealsProps {
  user: Employee;
  onBack: () => void;
  preselectedType?: 'Absent' | 'Late' | 'Fine' | 'Salary' | 'Other';
  preselectedDate?: string;
  preselectedId?: string;
}

const APPEAL_REASONS: Record<string, string[]> = {
  'Absent': ['Medical Emergency', 'Family Emergency', 'Transport Issue', 'System Error', 'Other'],
  'Late': ['Traffic', 'Transport Delay', 'Medical Reason', 'Family Emergency', 'Other'],
  'Fine': ['Wrongly Applied', 'Already Paid', 'Dispute Amount', 'Other'],
  'Salary': ['Wrong Calculation', 'Missing Bonus', 'Deduction Issue', 'Other'],
  'Other': ['General Query', 'Policy Clarification', 'Other']
};

const EmployeeAppeals: React.FC<EmployeeAppealsProps> = ({ 
  user, 
  onBack, 
  preselectedType,
  preselectedDate,
  preselectedId 
}) => {
  const [type, setType] = useState<'Absent' | 'Late' | 'Fine' | 'Salary' | 'Other'>(preselectedType || 'Absent');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState(preselectedDate || '');
  const [myAppeals, setMyAppeals] = useState<Appeal[]>([]);

  useEffect(() => {
    (async () => {
      await fetchAppeals();
      const appeals = storage.getAppeals().filter(a => a.employeeId === user.id);
      setMyAppeals(appeals);
    })();
  }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }
    if (!message.trim()) {
      toast.error('Please write a message');
      return;
    }
    if ((type === 'Absent' || type === 'Late') && !date) {
      toast.error('Please select the date');
      return;
    }

    const newAppeal: Appeal = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: user.id,
      employeeName: user.name,
      type,
      reason,
      message: message.trim(),
      status: 'Pending',
      date: date || new Date().toISOString().split('T')[0],
      appealDate: new Date().toISOString().split('T')[0],
      relatedId: preselectedId
    };

    await addAppeal(newAppeal);
    const appeals = storage.getAppeals().filter(a => a.employeeId === user.id);
    setMyAppeals(appeals);
    storage.addLog('Appeal', `New ${type} appeal submitted`, user.name);
    
    setReason('');
    setMessage('');
    setDate('');
    
    toast.success('Appeal submitted successfully!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'Rejected': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-success/10 text-success border-success/20';
      case 'Rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-foreground">Submit Appeal</h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Request review for attendance or fines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submit Form */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-card">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            New Appeal
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Appeal Type */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-3">Appeal Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(['Absent', 'Late', 'Fine', 'Salary', 'Other'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setType(t); setReason(''); }}
                    className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      type === t 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Date (for Absent/Late) */}
            {(type === 'Absent' || type === 'Late') && (
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select reason...</option>
                {APPEAL_REASONS[type].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Your Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Explain your situation in detail..."
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full gradient-primary text-primary-foreground py-4 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Submit Appeal
            </button>
          </form>
        </div>

        {/* My Appeals History */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
          <div className="p-6 border-b border-border bg-secondary/30">
            <h2 className="text-xl font-bold text-foreground">My Appeals</h2>
          </div>
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {myAppeals.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground italic">
                No appeals submitted yet
              </div>
            ) : (
              myAppeals.map(appeal => (
                <div key={appeal.id} className="p-5 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-foreground">{appeal.type}</span>
                        <span className="text-xs text-muted-foreground">• {appeal.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{appeal.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{appeal.message}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusClass(appeal.status)}`}>
                      {getStatusIcon(appeal.status)}
                      {appeal.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAppeals;
