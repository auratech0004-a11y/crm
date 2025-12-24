import React, { useState, useEffect } from 'react';
import { fineAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Receipt, AlertTriangle, Wallet, CreditCard, MoreVertical, AlertCircle } from 'lucide-react';

const EmployeeFines = ({ user, onAppeal }) => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    loadFines();
  }, [user.id]);

  const loadFines = async () => {
    try {
      const data = await fineAPI.getAll({ employee_id: user.id });
      setFines(data);
    } catch (error) {
      toast.error('Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async (fineId) => {
    try {
      await fineAPI.update(fineId, { status: 'Paid' });
      loadFines();
      toast.success('Payment successful! Fine status updated.');
    } catch (error) {
      toast.error('Failed to process payment');
    }
  };

  const pendingAmount = fines.filter((f) => f.status === 'Unpaid').reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = fines.filter((f) => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up" data-testid="employee-fines">
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
            <p className="text-3xl font-black text-destructive">₨ {pendingAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase">Pending To Pay</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl flex items-center gap-4 shadow-card">
          <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center text-xl">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-black text-success">₨ {paidAmount.toLocaleString()}</p>
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
              <th className="px-6 py-5">Date</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {fines.map((f) => (
              <tr key={f.id} className="hover:bg-secondary/30" data-testid={`fine-record-${f.id}`}>
                <td className="px-6 py-5">
                  <p className="font-bold text-foreground">{f.reason}</p>
                </td>
                <td className="px-6 py-5 font-black text-destructive">₨ {f.amount.toLocaleString()}</td>
                <td className="px-6 py-5 text-muted-foreground">{f.date}</td>
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
                <td className="px-6 py-5">
                  <div className="relative inline-block">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === f.id ? null : f.id)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      data-testid={`fine-menu-${f.id}`}
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>

                    {openMenuId === f.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-2xl py-2 min-w-[180px] dropdown-enter">
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
                  </div>
                </td>
              </tr>
            ))}
            {fines.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground font-medium italic">
                  Your fine record is clear. Keep up the good work!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeFines;
