import React, { useState, useEffect } from 'react';
import { appealAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

const AdminAppeals = () => {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppeals();
  }, []);

  const loadAppeals = async () => {
    try {
      const data = await appealAPI.getAll();
      setAppeals(data);
    } catch (error) {
      toast.error('Failed to load appeals');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (appealId, status) => {
    try {
      await appealAPI.update(appealId, { status });
      loadAppeals();
      toast.success(`Appeal ${status.toLowerCase()}`);
    } catch (error) {
      toast.error('Failed to update appeal status');
    }
  };

  const pending = appeals.filter((a) => a.status === 'Pending');
  const history = appeals.filter((a) => a.status !== 'Pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up" data-testid="admin-appeals">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Appeals</h1>
        <p className="text-muted-foreground mt-1">Review employee appeals and requests</p>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
        <div className="p-6 border-b border-border bg-secondary/30">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            Pending Appeals ({pending.length})
          </h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-secondary/50">
            <tr className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b border-border">
              <th className="px-8 py-4">Employee</th>
              <th className="px-8 py-4">Type</th>
              <th className="px-8 py-4">Reason</th>
              <th className="px-8 py-4">Date</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pending.map((appeal) => (
              <tr key={appeal.id} className="hover:bg-secondary/30 transition-colors" data-testid={`appeal-row-${appeal.id}`}>
                <td className="px-8 py-6">
                  <p className="font-bold text-foreground">{appeal.employee_name}</p>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold">{appeal.type}</span>
                </td>
                <td className="px-8 py-6">
                  <p className="text-muted-foreground text-sm">{appeal.reason}</p>
                  <p className="text-xs text-muted-foreground/70 italic mt-1">"{appeal.message}"</p>
                </td>
                <td className="px-8 py-6 text-sm text-muted-foreground">{appeal.date}</td>
                <td className="px-8 py-6 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleAction(appeal.id, 'Approved')}
                      className="p-2 bg-success text-success-foreground rounded-xl hover:bg-success/90 transition-colors"
                      data-testid={`approve-appeal-${appeal.id}`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAction(appeal.id, 'Rejected')}
                      className="p-2 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-colors"
                      data-testid={`reject-appeal-${appeal.id}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pending.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center text-muted-foreground italic">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  No pending appeals
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {history.length > 0 && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
          <div className="p-6 border-b border-border bg-secondary/30">
            <h3 className="font-bold text-foreground">Appeal History</h3>
          </div>
          <div className="divide-y divide-border">
            {history.slice(0, 10).map((appeal) => (
              <div key={appeal.id} className="px-8 py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">{appeal.employee_name}</p>
                  <p className="text-xs text-muted-foreground">{appeal.type} • {appeal.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  appeal.status === 'Approved' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                }`}>
                  {appeal.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppeals;
