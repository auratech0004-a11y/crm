import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/store';
import { Leave } from '@/types';
import { Check, X, Clock } from 'lucide-react';
import { fetchLeaves, updateLeaveStatus } from '@/integrations/supabase/service';
import { toast } from 'sonner';

const AdminLeave: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  
  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    const allLeaves = await storage.getLeaves();
    setLeaves(allLeaves);
  };

  const handleAction = async (leaveId: string, status: 'Approved' | 'Rejected') => {
    await updateLeaveStatus(leaveId, status);
    loadLeaves();
    toast.success(`Leave request ${status.toLowerCase()}`);
  };

  const pending = leaves.filter(l => l.status === 'Pending');
  const history = leaves.filter(l => l.status !== 'Pending');

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
        <p className="text-muted-foreground mt-1">Review and approve employee leave requests</p>
      </div>
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
        <div className="p-6 border-b border-border bg-secondary/30">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            Pending Requests ({pending.length})
          </h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-secondary/50">
            <tr className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b border-border">
              <th className="px-8 py-4">Employee</th>
              <th className="px-8 py-4">Type</th>
              <th className="px-8 py-4">Duration</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pending.map(l => (
              <tr key={l.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-bold text-foreground">{l.employeeName}</p>
                  <p className="text-xs text-muted-foreground italic">"{l.reason}"</p>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold">{l.type}</span>
                </td>
                <td className="px-8 py-6 text-sm">
                  <p className="font-bold text-foreground">{l.startDate}</p>
                  <p className="text-xs text-muted-foreground">to {l.endDate}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleAction(l.id, 'Approved')}
                      className="p-2 bg-success text-success-foreground rounded-xl hover:bg-success/90 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAction(l.id, 'Rejected')}
                      className="p-2 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pending.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-16 text-center text-muted-foreground italic">
                  No pending leave requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {history.length > 0 && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
          <div className="p-6 border-b border-border bg-secondary/30">
            <h3 className="font-bold text-foreground">Request History</h3>
          </div>
          <div className="divide-y divide-border">
            {history.slice(0, 10).map(l => (
              <div key={l.id} className="px-8 py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">{l.employeeName}</p>
                  <p className="text-xs text-muted-foreground">{l.type} • {l.startDate} to {l.endDate}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  l.status === 'Approved' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                }`}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeave;