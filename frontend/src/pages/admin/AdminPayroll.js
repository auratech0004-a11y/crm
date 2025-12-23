import React, { useState, useEffect } from 'react';
import { payrollAPI, employeeAPI, fineAPI } from '../../lib/api';
import { toast } from 'sonner';
import { DollarSign, CheckCircle, Clock, Download } from 'lucide-react';

const AdminPayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [payrollStatus, setPayrollStatus] = useState({});
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [empData, statusData, finesData] = await Promise.all([
        employeeAPI.getAll(),
        payrollAPI.getStatus(),
        fineAPI.getAll(),
      ]);
      setEmployees(empData.filter((e) => e.role === 'EMPLOYEE'));
      setPayrollStatus(statusData);
      setFines(finesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPayroll = async () => {
    setIsProcessing(true);
    try {
      await payrollAPI.process({});
      await loadData();
      toast.success('Payroll processed successfully!');
    } catch (error) {
      toast.error('Failed to process payroll');
    } finally {
      setIsProcessing(false);
    }
  };

  const getEmployeeFines = (empId) => {
    return fines.filter((f) => f.employee_id === empId && f.status === 'Unpaid')
      .reduce((sum, f) => sum + f.amount, 0);
  };

  const totalPayroll = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
  const paidCount = Object.values(payrollStatus).filter((s) => s === 'Paid').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up" data-testid="admin-payroll">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payroll Management</h1>
          <p className="text-muted-foreground mt-1">Process and track monthly salaries</p>
        </div>
        <button
          onClick={processPayroll}
          disabled={isProcessing}
          className="gradient-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          data-testid="process-payroll-btn"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <DollarSign className="w-5 h-5" />
              Process Payroll
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-3xl shadow-card flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">₨ {totalPayroll.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase">Total Monthly Payroll</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl shadow-card flex items-center gap-4">
          <div className="w-14 h-14 bg-success/10 text-success rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-black text-success">{paidCount}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase">Paid This Month</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl shadow-card flex items-center gap-4">
          <div className="w-14 h-14 bg-warning/10 text-warning rounded-2xl flex items-center justify-center">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-black text-warning">{employees.length - paidCount}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase">Pending</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
        <table className="w-full text-left">
          <thead className="bg-secondary">
            <tr className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b border-border">
              <th className="px-8 py-5">Employee</th>
              <th className="px-8 py-5">Designation</th>
              <th className="px-8 py-5">Base Salary</th>
              <th className="px-8 py-5">Deductions</th>
              <th className="px-8 py-5">Net Salary</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {employees.map((emp) => {
              const isPaid = payrollStatus[emp.id] === 'Paid';
              const empFines = getEmployeeFines(emp.id);
              const netSalary = (emp.salary || 0) - empFines;
              return (
                <tr key={emp.id} className="hover:bg-secondary/50 transition-colors" data-testid={`payroll-row-${emp.id}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-primary">
                        {emp.name.charAt(0)}
                      </div>
                      <p className="font-bold text-foreground">{emp.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-muted-foreground">{emp.designation}</td>
                  <td className="px-8 py-6 font-bold text-foreground">₨ {(emp.salary || 0).toLocaleString()}</td>
                  <td className="px-8 py-6 font-bold text-destructive">₨ {empFines.toLocaleString()}</td>
                  <td className="px-8 py-6 font-bold text-success">₨ {netSalary.toLocaleString()}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      isPaid
                        ? 'bg-success/10 text-success border-success/30'
                        : 'bg-warning/10 text-warning border-warning/30'
                    }`}>
                      {isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {employees.length === 0 && (
              <tr>
                <td colSpan={7} className="px-8 py-16 text-center text-muted-foreground italic">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayroll;
