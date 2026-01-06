import React, { useState, useEffect } from 'react';
import { Employee, Fine } from '@/types';
import { storage } from '@/lib/store';
import { Receipt, AlertTriangle, Wallet, CreditCard, MoreVertical, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EmployeeFinesProps {
  user: Employee;
  onAppeal?: (fineId: string) => void;
}

const EmployeeFines: React.FC<EmployeeFinesProps> = ({ user, onAppeal }) => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  useEffect(() => {
    const loadFines = async () => {
      const allFines = await storage.getFines();
      setFines(allFines.filter(f => f.employeeId === user.id));
    };
    
    loadFines();
  }, [user.id]);

  const handlePayFine = async (fineId: string) => {
    const allFines = await storage.getFines();
    const updated = allFines.map(f => f.id === fineId ? { ...f, status: 'Paid' as const } : f);
    // Assuming storage has a setFines method or we update via API
    setFines(updated.filter(f => f.employeeId === user.id));
    toast.success('Payment successful! Fine status updated.');
  };

  const pendingAmount = fines.filter(f => f.status === 'Unpaid').reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = fines.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Fines</h1>
        <p className="text-muted-foreground mt-1 font-medium">Manage and settle your outstanding penalties</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-3xl flex items-center gap-4 shadow-card">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">{fines.length}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase">Total Records</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl flex items-center gap-4 shadow-card">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center text-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-black text-destructive">₨ {pendingAmount}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase">Pending To Pay</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl flex items-center gap-4 shadow-card">
          <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center text-xl">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-black text-success">₨ {paidAmount}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase">Cleared Amount</p>
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
        <div className="p-6 border-b border-border bg-secondary/30">
          <h3 className="font-bold text-foreground">Fine History</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-secondary/50">
            <tr className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b border-border">
              <th className="px-6 py-5">Reason</th>
              <th className="px-6 py-5">Amount</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {fines.map(f => (
              <tr key={f.id} className="hover:bg-secondary/30">
                <td className="px-6 py-5">
                  <p className="font-bold text-foreground">{f.reason}</p>
                  <p className="text-[10px] text-muted-foreground">{f.date}</p>
                </td>
                <td className="px-6 py-5 font-black text-destructive">₨ {f.amount}</td>
                <td className="px-6 py-5">
                  {f.status === 'Paid' ? (
                    <span className="text-[10px] font-bold uppercase px-3 py-1.5 bg-success/10 text-success rounded-full border border-success/20">Cleared</span>
                  ) : (
                    <button
                      onClick={() => handlePayFine(f.id)}
                      className="bg-destructive text-destructive-foreground px-4 py-2 rounded-xl text-[10px] font-bold uppercase shadow-lg active:scale-95 transition-all inline-flex items-center gap-2"
                    >
                      <CreditCard className="w-3 h-3" />
                      Pay
                    </button>
                  )}
                </td>
                <td className="px-6 py-5 relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === f.id ? null : f.id)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {openMenuId === f.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-6 top-12 z-20 bg-card border border-border rounded-xl shadow-lg py-2 min-w-[160px]">
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            onAppeal?.(f.id);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm font-medium text-foreground hover:bg-secondary flex items-center gap-2 transition-colors"
                        >
                          <AlertCircle className="w-4 h-4 text-warning" />
                          Submit Appeal
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {fines.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-muted-foreground font-medium italic">Your fine record is clear. Keep up the good work!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeFines;