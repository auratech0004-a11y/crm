import React, { useState, useEffect } from 'react';
import { fineAPI, employeeAPI } from '../../lib/api';
import { toast } from 'sonner';
import { AlertTriangle, Plus, X, Edit2, Trash2 } from 'lucide-react';

const AdminFines = () => {
  const [fines, setFines] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingFine, setEditingFine] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    amount: 0,
    reason: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [finesData, empData] = await Promise.all([
        fineAPI.getAll(),
        employeeAPI.getAll(),
      ]);
      setFines(finesData);
      setEmployees(empData.filter((e) => e.role === 'EMPLOYEE'));
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingFine) {
        await fineAPI.update(editingFine.id, formData);
        toast.success('Fine updated successfully');
      } else {
        await fineAPI.create(formData);
        toast.success('Fine added successfully');
      }
      loadData();
      setModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save fine');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fine?')) {
      try {
        await fineAPI.delete(id);
        loadData();
        toast.success('Fine deleted successfully');
      } catch (error) {
        toast.error('Failed to delete fine');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      amount: 0,
      reason: '',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingFine(null);
  };

  const openEdit = (fine) => {
    setEditingFine(fine);
    setFormData({
      employee_id: fine.employee_id,
      amount: fine.amount,
      reason: fine.reason,
      date: fine.date,
    });
    setModalOpen(true);
  };

  const getEmployeeName = (empId) => {
    const emp = employees.find((e) => e.id === empId);
    return emp?.name || 'Unknown';
  };

  const totalFines = fines.reduce((sum, f) => sum + f.amount, 0);
  const unpaidFines = fines.filter((f) => f.status === 'Unpaid').reduce((sum, f) => sum + f.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up" data-testid="admin-fines">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fine Management</h1>
          <p className="text-muted-foreground mt-1">Manage employee fines and penalties</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="gradient-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
          data-testid="add-fine-btn"
        >
          <Plus className="w-5 h-5" />
          Add Fine
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-3xl shadow-card flex items-center gap-4">
          <div className="w-14 h-14 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">₨ {totalFines.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase">Total Fines</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl shadow-card flex items-center gap-4">
          <div className="w-14 h-14 bg-warning/10 text-warning rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-black text-warning">₨ {unpaidFines.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase">Unpaid</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl shadow-card flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">{fines.length}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase">Total Records</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
        <table className="w-full text-left">
          <thead className="bg-secondary">
            <tr className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b border-border">
              <th className="px-8 py-5">Employee</th>
              <th className="px-8 py-5">Reason</th>
              <th className="px-8 py-5">Amount</th>
              <th className="px-8 py-5">Date</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {fines.map((fine) => (
              <tr key={fine.id} className="hover:bg-secondary/50 transition-colors" data-testid={`fine-row-${fine.id}`}>
                <td className="px-8 py-6 font-bold text-foreground">{getEmployeeName(fine.employee_id)}</td>
                <td className="px-8 py-6 text-muted-foreground">{fine.reason}</td>
                <td className="px-8 py-6 font-bold text-destructive">₨ {fine.amount.toLocaleString()}</td>
                <td className="px-8 py-6 text-muted-foreground">{fine.date}</td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    fine.status === 'Paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}>
                    {fine.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => openEdit(fine)}
                      className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(fine.id)}
                      className="p-2 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {fines.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-16 text-center text-muted-foreground italic">
                  No fines recorded
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border animate-scale-in">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-bold text-foreground">
                {editingFine ? 'Edit Fine' : 'Add New Fine'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4" data-testid="fine-form">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase">Employee</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-secondary border-0 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase">Amount (PKR)</label>
                <input
                  required
                  type="number"
                  className="w-full px-4 py-3 bg-secondary border-0 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase">Reason</label>
                <input
                  required
                  className="w-full px-4 py-3 bg-secondary border-0 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g., Late arrival"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase">Date</label>
                <input
                  required
                  type="date"
                  className="w-full px-4 py-3 bg-secondary border-0 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3.5 font-bold text-muted-foreground border border-border rounded-xl hover:bg-secondary">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3.5 gradient-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20">
                  {editingFine ? 'Save Changes' : 'Add Fine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFines;
