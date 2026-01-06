import React, { useMemo, useState, useEffect } from 'react';
import { storage } from '@/lib/store';
import { Employee, Attendance } from '@/types';
import { DollarSign, CheckCircle, Clock, Download } from 'lucide-react';
import { toast } from 'sonner';

const AdminPayroll: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollStatus, setPayrollStatus] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  useEffect(() => {
    setEmployees(storage.getEmployees().filter(e => e.role === 'EMPLOYEE'));
    setPayrollStatus(storage.getPayrollStatus());
    setAttendance(storage.getAttendance());
  }, []);

  const getMonthRange = (date = new Date()) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start, end };
  };

  const isSunday = (d: Date) => d.getDay() === 0;

  // Per requirements: Sundays must be excluded; standard month considered as 26 working days
  const workingDaysInMonth = useMemo(() => {
    const { start, end } = getMonthRange();
    let days = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (!isSunday(d)) days++;
    }
    return Math.min(days, 26);
  }, []);

  const employeeAttendanceSummary = useMemo(() => {
    const map: Record<string, { present: number; absent: number }> = {};
    const { start, end } = getMonthRange();
    const validDates: Set<string> = new Set();
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (!isSunday(d)) {
        const key = d.toISOString().slice(0, 10);
        validDates.add(key);
      }
    }

    const grouped: Record<string, Record<string, Attendance[]>> = {};
    attendance.forEach((a) => {
      const day = a.date?.slice(0, 10);
      if (!day || !validDates.has(day)) return;
      grouped[a.employeeId] = grouped[a.employeeId] || {};
      grouped[a.employeeId][day] = grouped[a.employeeId][day] || [];
      grouped[a.employeeId][day].push(a);
    });

    employees.forEach((emp) => {
      let present = 0;
      validDates.forEach((day) => {
        const logs = grouped[emp.id]?.[day] || [];
        // Only count a day as present if there is BOTH a proper check-in and check-out record
        const hasCheckIn = logs.some((l: any) => !!l?.checkIn || !!l?.check_in);
        const hasCheckOut = logs.some((l: any) => !!l?.checkOut || !!l?.check_out);
        if (hasCheckIn && hasCheckOut) present += 1;
      });
      const absent = Math.max(workingDaysInMonth - present, 0);
      map[emp.id] = { present, absent };
    });

    return map;
  }, [attendance, employees, workingDaysInMonth]);

  const computePayroll = (emp: Employee) => {
    const allowedDesignations = [
      'Digital Commerce Trainee',
      'Digital Commerce Probationer',
      'Digital Commerce Associate',
    ];
    
    const designation = allowedDesignations.includes(emp.designation) 
      ? emp.designation 
      : 'Digital Commerce Trainee';
      
    const basic = emp.salary || 0;
    // Per-day salary = Basic / 26 (rounded as per sample slip)
    const perDay = Math.round(basic / 26);
    
    const { present, absent } = employeeAttendanceSummary[emp.id] || { present: 0, absent: workingDaysInMonth };
    const deduction = perDay * absent;
    const net = Math.max(basic - deduction, 0);
    
    return {
      designation,
      workingDays: workingDaysInMonth,
      present,
      absent,
      basic,
      perDay,
      deduction,
      net,
    };
  };

  const processPayroll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newStatus: Record<string, string> = {};
      employees.forEach(emp => {
        newStatus[emp.id] = 'Paid';
      });
      storage.setPayrollStatus(newStatus);
      setPayrollStatus(newStatus);
      storage.addLog('Payroll', 'Monthly payroll processed using attendance-based rules', 'Admin');
      setIsProcessing(false);
      toast.success('Payroll processed successfully!');
    }, 1200);
  };

  const downloadSlip = async (emp: Employee) => {
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const calc = computePayroll(emp);
    
    // Lazy-load jsPDF from CDN so no bundler config is required
    const loadJsPDF = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        if ((window as any).jspdf?.jsPDF) return resolve((window as any).jspdf.jsPDF);
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
        script.onload = () => resolve((window as any).jspdf.jsPDF);
        script.onerror = () => reject(new Error('Failed to load jsPDF'));
        document.body.appendChild(script);
      });
    };

    try {
      const JS_PDF: any = await loadJsPDF();
      const doc = new JS_PDF({ unit: 'pt', format: 'a4' });
      const pad = 40;
      let y = pad;
      const right = 555; // A4 width minus right padding
      
      const drawRow = (label: string, value: string | number, yPos: number, labelX = pad, valueX = 320) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(String(label), labelX, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(String(value), valueX, yPos);
      };

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Monthly Salary Slip', pad, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(month, right, y, { align: 'right' });
      y += 18;

      // Divider
      doc.setDrawColor(220);
      doc.line(pad, y, right, y);
      y += 18;

      // Employee details
      drawRow('Employee Name', emp.name, y);
      y += 18;
      drawRow('Employee ID', emp.employeeId || emp.id, y);
      y += 18;
      drawRow('Designation', calc.designation, y);
      y += 24;

      // Attendance Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Attendance:', pad, y);
      y += 16;
      doc.setFont('helvetica', 'normal');
      drawRow('Total Working Days', calc.workingDays, y);
      y += 18;
      drawRow('Present Days', calc.present, y);
      y += 18;
      drawRow('Absent Days', calc.absent, y);
      y += 24;

      // Salary details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Salary Details:', pad, y);
      y += 16;
      doc.setFont('helvetica', 'normal');
      
      const cur = (n: number) => `₨ ${n.toLocaleString()}`;
      drawRow('Basic Salary', cur(calc.basic), y);
      y += 18;
      drawRow('Per-Day Salary', cur(calc.perDay), y);
      y += 18;
      drawRow('Deduction for Absent Days', cur(calc.deduction), y);
      y += 18;

      // Net Salary box
      y += 10;
      doc.setDrawColor(100);
      doc.setLineWidth(0.5);
      doc.roundedRect(pad, y, right - pad - pad, 36, 6, 6);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Net Salary Payable', pad + 12, y + 22);
      doc.setFontSize(16);
      doc.text(cur(calc.net), right - 12, y + 24, { align: 'right' });
      y += 60;

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text('Prepared By:', pad, y);
      doc.text('Approved By:', right - 180, y);
      y += 28;
      doc.setDrawColor(160);
      doc.line(pad, y, pad + 200, y);
      doc.line(right - 180, y, right - 180 + 200, y);

      const fileSafe = emp.name.replace(/[^a-z0-9]/gi, '_');
      doc.save(`Payroll_Slip_${fileSafe}_${month}.pdf`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const paidCount = Object.values(payrollStatus).filter(s => s === 'Paid').length;

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payroll Management</h1>
          <p className="text-muted-foreground mt-1">Process and track monthly salaries</p>
        </div>
        <button 
          onClick={processPayroll} 
          disabled={isProcessing}
          className="gradient-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
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
              <th className="px-8 py-5">Salary</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {employees.map(emp => {
              const isPaid = payrollStatus[emp.id] === 'Paid';
              return (
                <tr key={emp.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-primary">
                        {emp.name.charAt(0)}
                      </div>
                      <p className="font-bold text-foreground">{emp.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-muted-foreground">{computePayroll(emp).designation}</td>
                  <td className="px-8 py-6 font-bold text-foreground">₨ {emp.salary.toLocaleString()}</td>
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
                    <button 
                      onClick={() => downloadSlip(emp)}
                      className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20"
                      data-testid={`download-slip-${emp.id}`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayroll;