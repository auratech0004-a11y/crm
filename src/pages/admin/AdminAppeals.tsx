import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/store';
import { Appeal, Attendance } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Check, X, AlertCircle, MessageSquare, Calendar, User, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAppeals, updateAppealStatus, markAttendanceStatus } from '@/integrations/supabase/service';

const AdminAppeals: React.FC = () => {
  const { user } = useAuth();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);

  useEffect(() => {
    loadAppeals();
  }, []);

  const loadAppeals = () => {
    const allAppeals = storage.getAppeals();
    setAppeals(allAppeals);
  };

  const handleAction = async (appealId: string, status: 'Approved' | 'Rejected') => {
    const allAppeals = storage.getAppeals();
    const appeal = allAppeals.find(a => a.id === appealId);
    
    if (appeal && status === 'Approved') {
      if (appeal.type === 'Absent') {
        await markAttendanceStatus(appeal.employeeId, appeal.date!, { status: 'Present', method: 'Manual', checkIn: '09:00' });
        toast.success(`Attendance marked for ${appeal.employeeName} on ${appeal.date}`);
      }
      
      if (appeal.type === 'Late') {
        await markAttendanceStatus(appeal.employeeId, appeal.date!, { status: 'Present' });
        toast.success(`Late mark removed for ${appeal.employeeName}`);
      }
      
      if (appeal.type === 'Fine' && appeal.relatedId) {
        const fines = storage.getFines();
        const updatedFines = fines.filter(f => f.id !== appeal.relatedId);
        storage.setFines(updatedFines);
        toast.success(`Fine removed for ${appeal.employeeName}`);
      }
    }
    
    await updateAppealStatus(appealId, status);
    loadAppeals();
    setSelectedAppeal(null);
    storage.addLog('Appeal', `Appeal ${status.toLowerCase()} for ${appeal?.employeeName}`, user?.name || 'Admin');
    if (status === 'Rejected') {
      toast.info('Appeal rejected');
    }
  };

  const pending = appeals.filter(a => a.status === 'Pending');
  const resolved = appeals.filter(a => a.status !== 'Pending');

  const getTypeClass = (type: string) => {
    switch (type) {
      case 'Absent': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Late': return 'bg-warning/10 text-warning border-warning/20';
      case 'Fine': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Appeals & Grievances</h1>
        <p className="text-muted-foreground mt-1">Handle employee appeals and concerns</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-3xl shadow-card flex items-center gap-4">
          <div className="w-14 h-14 bg-warning/10 text-warning rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">{pending.length}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase">Pending</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl shadow-card flex items-center gap-4">
          <div className="w-14 h-14 bg-success/10 text-success rounded-2xl flex items-center justify-center">
            <Check className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">{resolved.filter(a => a.status === 'Approved').length}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase">Approved</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl shadow-card flex items-center gap-4">
          <div className="w-14 h-14 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center">
            <X className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">{resolved.filter(a => a.status === 'Rejected').length}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase">Rejected</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Appeals */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
          <div className="p-6 border-b border-border bg-secondary/30">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Pending Appeals ({pending.length})
            </h3>
          </div>
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {pending.map(appeal => (
              <div 
                key={appeal.id} 
                onClick={() => setSelectedAppeal(appeal)}
                className="p-5 hover:bg-secondary/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-foreground">{appeal.employeeName}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getTypeClass(appeal.type)}`}>
                        {appeal.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{appeal.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">Date: {appeal.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAction(appeal.id, 'Approved'); }}
                      className="p-2 bg-success text-success-foreground rounded-xl hover:bg-success/90 transition-colors"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAction(appeal.id, 'Rejected'); }}
                      className="p-2 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-colors"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="p-16 text-center text-muted-foreground italic">
                No pending appeals
              </div>
            )}
          </div>
        </div>
        
        {/* Appeal Detail / History */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
          {selectedAppeal ? (
            <>
              <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between">
                <h3 className="font-bold text-foreground">Appeal Details</h3>
                <button 
                  onClick={() => setSelectedAppeal(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-foreground">{selectedAppeal.employeeName}</p>
                    <p className="text-sm text-muted-foreground">Employee</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/50 p-4 rounded-xl">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Type</p>
                    <span className={`px-3 py-1 rounded text-sm font-bold border ${getTypeClass(selectedAppeal.type)}`}>
                      {selectedAppeal.type}
                    </span>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-xl">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Date</p>
                    <p className="font-bold text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {selectedAppeal.date}
                    </p>
                  </div>
                </div>
                <div className="bg-secondary/50 p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Reason</p>
                  <p className="font-bold text-foreground">{selectedAppeal.reason}</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Message
                  </p>
                  <p className="text-foreground">{selectedAppeal.message}</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Submitted On</p>
                  <p className="text-foreground">{selectedAppeal.appealDate}</p>
                </div>
                {selectedAppeal.status === 'Pending' && (
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => handleAction(selectedAppeal.id, 'Approved')}
                      className="flex-1 py-3 bg-success text-success-foreground rounded-xl font-bold hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Approve
                    </button>
                    <button 
                      onClick={() => handleAction(selectedAppeal.id, 'Rejected')}
                      className="flex-1 py-3 bg-destructive text-destructive-foreground rounded-xl font-bold hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="p-6 border-b border-border bg-secondary/30">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-success" />
                  Recent History
                </h3>
              </div>
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {resolved.slice(0, 10).map(appeal => (
                  <div key={appeal.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-foreground">{appeal.employeeName}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getTypeClass(appeal.type)}`}>
                            {appeal.type}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{appeal.reason}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusClass(appeal.status)}`}>
                        {appeal.status}
                      </span>
                    </div>
                  </div>
                ))}
                {resolved.length === 0 && (
                  <div className="p-16 text-center text-muted-foreground italic">
                    No appeal history
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAppeals;