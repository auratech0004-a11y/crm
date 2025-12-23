import React, { useState, useEffect } from 'react';
import { payrollAPI, fineAPI } from '../../lib/api';
import { DollarSign, CheckCircle, Clock, FileText, Download } from 'lucide-react';

const EmployeeSalary = ({ user }) => {
  const [isPaid, setIsPaid] = useState(false);
  const [fines, setFines] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      const [statusData, finesData] = await Promise.all([
        payrollAPI.getStatus(),
        fineAPI.getAll({ employee_id: user.id }),
      ]);
      setIsPaid(statusData[user.id] === 'Paid');
      const unpaidFines = finesData.filter((f) => f.status === 'Unpaid').reduce((sum, f) => sum + f.amount, 0);
      setFines(unpaidFines);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const netSalary = (user.salary || 0) - fines;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up" data-testid="employee-salary">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Salary Details</h1>
        <p className="text-muted-foreground mt-1 font-medium italic">Your monthly earnings and payslips</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-8 rounded-3xl flex items-center gap-6 shadow-card">
          <div className="w-16 h-16 bg-success/10 text-success rounded-2xl flex items-center justify-center text-3xl">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-4xl font-black text-foreground">₨ {(user.salary || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Current Base Salary</p>
          </div>
        </div>
        <div className="bg-card border border-border p-8 rounded-3xl flex items-center gap-6 shadow-card">
          <div className={`w-16 h-16 ${isPaid ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'} rounded-2xl flex items-center justify-center text-3xl`}>
            {isPaid ? <CheckCircle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
          </div>
          <div>
            <p className={`text-2xl font-black ${isPaid ? 'text-success' : 'text-destructive'}`}>
              {isPaid ? 'PAID' : 'PENDING'}
            </p>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Monthly Disbursement Status</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-card">
        {isPaid ? (
          <div className="space-y-4">
            <FileText className="w-16 h-16 text-primary mx-auto mb-2" />
            <h2 className="text-xl font-bold text-foreground">Payslip Available</h2>
            <button className="gradient-primary text-primary-foreground px-8 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all inline-flex items-center gap-2">
              <Download className="w-4 h-4" />
              DOWNLOAD PAYSLIP
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Clock className="w-16 h-16 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground font-bold italic opacity-40">Monthly payroll has not been generated yet.</p>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
        <div className="p-6 border-b border-border bg-secondary/30">
          <h3 className="font-bold text-foreground">Salary Breakdown</h3>
        </div>
        <div className="divide-y divide-border">
          <div className="px-8 py-4 flex items-center justify-between">
            <span className="text-muted-foreground">Base Salary</span>
            <span className="font-bold text-foreground">₨ {(user.salary || 0).toLocaleString()}</span>
          </div>
          <div className="px-8 py-4 flex items-center justify-between">
            <span className="text-muted-foreground">Allowances</span>
            <span className="font-bold text-success">+ ₨ 0</span>
          </div>
          <div className="px-8 py-4 flex items-center justify-between">
            <span className="text-muted-foreground">Fines Deduction</span>
            <span className="font-bold text-destructive">- ₨ {fines.toLocaleString()}</span>
          </div>
          <div className="px-8 py-4 flex items-center justify-between bg-secondary/30">
            <span className="font-bold text-foreground">Net Salary</span>
            <span className="font-black text-xl text-primary">₨ {netSalary.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSalary;
