import React, { useState, useEffect } from 'react';
import { Employee, Leave } from '@/types';
import { storage } from '@/lib/store';
import { addLeave, fetchLeaves } from '@/integrations/supabase/service';
import { CalendarCheck, Plus, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const EmployeeLeave: React.FC<{ user: Employee }> = ({ user }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'Annual', startDate: '', endDate: '', reason: '' });
  const [leaves, setLeaves] = useState<Leave[]>([]);

  useEffect(() => {
    (async () => {
      await fetchLeaves();
      const allLeaves = storage.getLeaves();
      setLeaves(allLeaves.filter(l => l.employeeId === user.id));
    })();
  }, [user.id]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLeave: Leave = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: user.id,
      employeeName: user.name,
      ...formData,
      status: 'Pending',
      requestDate: new Date().toISOString().split('T')[0]
    };
    await addLeave(newLeave);
    const allLeaves = storage.getLeaves();
    setLeaves(allLeaves.filter(l => l.employeeId === user.id));

    storage.addLog('Leave', `Applied for ${formData.type} leave`, user.name);
    setModalOpen(false);
    setFormData({ type: 'Annual', startDate: '', endDate: '', reason: '' });
    toast.success('Leave request submitted successfully!');
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-foreground">Leave Requests</h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Apply and track your leaves</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-warning text-warning-foreground px-8 py-3 rounded-2xl font-bold shadow-lg shadow-warning/20 active:scale-95 transition-all flex items-center gap-3"
        >
          <Plus className="w-5 h-5" />
          APPLY LEAVE
        </button>
      </div>

      <div className="flex">
        <div className="bg-card border border-border p-6 rounded-3xl flex items-center gap-6 min-w-[240px] shadow-card">
          <div className="w-14 h-14 bg-warning/10 text-warning rounded-2xl flex items-center justify-center text-2xl">
            <CalendarCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-4xl font-black text-foreground">12</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Available Balance</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card min-h-[300px]">
        <table className="w-full text-left">
          <thead className="bg-secondary">
            <tr className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b border-border">
              <th className="px-8 py-5">Type</th>
              <th className="px-8 py-5">Duration</th>
              <th className="px-8 py-5">Reason</th>
              <th className="px-8 py-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leaves.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-muted-foreground font-medium italic">No leave requests found in history</td>
              </tr>
            ) : (
              leaves.map(l => (
                <tr key={l.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-foreground">{l.type}</td>
                  <td className="px-8 py-6 text-foreground">
                    <p className="font-bold text-sm">{l.startDate}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">to {l.endDate}</p>
                  </td>
                  <td className="px-8 py-6 text-muted-foreground text-sm italic">"{l.reason}"</td>
                  <td className="px-8 py-6 text-right">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border inline-flex items-center gap-1 ${
                      l.status === 'Pending' ? 'bg-warning/10 text-warning border-warning/20' : 
                      l.status === 'Approved' ? 'bg-success/10 text-success border-success/20' : 
                      'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                      {l.status === 'Pending' && <Clock className="w-3 h-3" />}
                      {l.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                      {l.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border animate-scale-in">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-black text-foreground">Request Leave</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Leave Type</label>
                <select 
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none focus:border-warning text-foreground"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option>Annual</option>
                  <option>Sick</option>
                  <option>Bereavement</option>
                  <option>Self Wedding</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Start Date</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none text-foreground" 
                    value={formData.startDate} 
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">End Date</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none text-foreground" 
                    value={formData.endDate} 
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })} 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Reason</label>
                <textarea 
                  required 
                  placeholder="Tell us why..." 
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none h-24 resize-none text-foreground" 
                  value={formData.reason} 
                  onChange={e => setFormData({ ...formData, reason: e.target.value })} 
                />
              </div>
              <button type="submit" className="w-full py-4 bg-warning text-warning-foreground font-black rounded-2xl shadow-xl active:scale-95 transition-all">
                SUBMIT REQUEST
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeave;
