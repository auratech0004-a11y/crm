import React, { useState, useEffect } from 'react';
import { appealAPI } from '../../lib/api';
import { toast } from 'sonner';
import { AlertCircle, Clock, CheckCircle, XCircle, ArrowLeft, Send } from 'lucide-react';

const EmployeeAppeals = ({ user, onBack, preselectedType, preselectedDate, preselectedId }) => {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(!!preselectedType);
  const [formData, setFormData] = useState({
    type: preselectedType || 'Other',
    reason: '',
    message: '',
    date: preselectedDate || new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadAppeals();
  }, [user.id]);

  useEffect(() => {
    if (preselectedType) {
      setFormData({
        type: preselectedType,
        reason: '',
        message: '',
        date: preselectedDate || new Date().toISOString().split('T')[0],
      });
      setModalOpen(true);
    }
  }, [preselectedType, preselectedDate]);

  const loadAppeals = async () => {
    try {
      const data = await appealAPI.getAll({ employee_id: user.id });
      setAppeals(data);
    } catch (error) {
      toast.error('Failed to load appeals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAppeal = async (e) => {
    e.preventDefault();
    try {
      await appealAPI.create({
        employee_id: user.id,
        employee_name: user.name,
        type: formData.type,
        reason: formData.reason,
        message: formData.message,
        date: formData.date,
        appeal_date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        related_id: preselectedId,
      });
      loadAppeals();
      setModalOpen(false);
      setFormData({ type: 'Other', reason: '', message: '', date: new Date().toISOString().split('T')[0] });
      toast.success('Appeal submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit appeal');
    }
  };

  const pendingCount = appeals.filter((a) => a.status === 'Pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up" data-testid="employee-appeals">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-secondary rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">My Appeals</h1>
          <p className="text-muted-foreground mt-1">Submit and track your appeals</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="gradient-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
          data-testid="new-appeal-btn"
        >
          <Send className="w-5 h-5" />
          New Appeal
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-3xl flex items-center gap-4 shadow-card">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">{appeals.length}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase">Total Appeals</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl flex items-center gap-4 shadow-card">
          <div className="w-12 h-12 bg-warning/10 text-warning rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-black text-warning">{pendingCount}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase">Pending</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl flex items-center gap-4 shadow-card">
          <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-black text-success">{appeals.filter((a) => a.status === 'Approved').length}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase">Approved</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
        <table className="w-full text-left">
          <thead className="bg-secondary">
            <tr className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b border-border">
              <th className="px-6 py-5">Type</th>
              <th className="px-6 py-5">Reason</th>
              <th className="px-6 py-5">Date</th>
              <th className="px-6 py-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {appeals.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-muted-foreground italic">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  No appeals submitted yet
                </td>
              </tr>
            ) : (
              appeals.map((appeal) => (
                <tr key={appeal.id} className="hover:bg-secondary/50 transition-colors" data-testid={`appeal-record-${appeal.id}`}>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold">{appeal.type}</span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-bold text-foreground">{appeal.reason}</p>
                    <p className="text-xs text-muted-foreground italic">"{appeal.message}"</p>
                  </td>
                  <td className="px-6 py-5 text-muted-foreground">{appeal.date}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                      appeal.status === 'Pending' ? 'bg-warning/10 text-warning' :
                      appeal.status === 'Approved' ? 'bg-success/10 text-success' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {appeal.status === 'Pending' && <Clock className="w-3 h-3" />}
                      {appeal.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                      {appeal.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                      {appeal.status}
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
              <h3 className="text-xl font-bold text-foreground">Submit Appeal</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitAppeal} className="p-6 space-y-4" data-testid="appeal-form">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Appeal Type</label>
                <select
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none text-foreground"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option>Absent</option>
                  <option>Late</option>
                  <option>Fine</option>
                  <option>Salary</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none text-foreground"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Reason</label>
                <input
                  required
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none text-foreground"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Brief reason for appeal"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Message</label>
                <textarea
                  required
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none h-24 resize-none text-foreground"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detailed explanation..."
                />
              </div>
              <button type="submit" className="w-full py-4 gradient-primary text-primary-foreground font-bold rounded-2xl shadow-lg active:scale-95 transition-all" data-testid="submit-appeal-btn">
                SUBMIT APPEAL
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAppeals;
