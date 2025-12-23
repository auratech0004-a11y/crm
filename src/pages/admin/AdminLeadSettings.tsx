import React, { useEffect, useMemo, useState } from 'react';
import { storage } from '@/lib/store';
import { Employee } from '@/types';
import { fetchEmployees } from '@/integrations/supabase/service';
import { upsertLeadPermissions, fetchLeadPermissions } from '@/integrations/supabase/service';
import { Users, ShieldCheck, Save, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const ALL_MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'leave', label: 'Leave' },
  { id: 'appeals', label: 'Appeals' },
  { id: 'fines', label: 'Fines' },
];

const AdminLeadSettings: React.FC = () => {
  const [leads, setLeads] = useState<Employee[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      await fetchEmployees();
      const emps = storage.getEmployees();
      setLeads(emps.filter(e => e.role === 'LEAD'));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selectedLeadId) return;
      setLoading(true);
      const perms = await fetchLeadPermissions(selectedLeadId);
      setModules(perms?.modules || []);
      setLoading(false);
    })();
  }, [selectedLeadId]);

  const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId) || null, [leads, selectedLeadId]);

  const toggleModule = (id: string) => {
    setModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!selectedLeadId) {
      toast.error('Select a lead first');
      return;
    }
    setLoading(true);
    await upsertLeadPermissions(selectedLeadId, modules);
    setLoading(false);
    toast.success('Lead permissions updated');
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lead Permissions</h1>
          <p className="text-muted-foreground mt-1">Choose a lead and assign admin modules</p>
        </div>
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/30">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" />
            Choose Lead
          </h2>
        </div>
        <div className="p-6">
          <select
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none text-foreground"
          >
            <option value="">Select a lead...</option>
            {leads.map(l => (
              <option key={l.id} value={l.id}>{l.name} ({l.username})</option>
            ))}
          </select>
          {!selectedLead && leads.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">No leads found. Edit an employee and set their role to LEAD first.</p>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/30">
          <h2 className="font-bold text-foreground">Module Permissions</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_MODULES.map(m => {
            const enabled = modules.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleModule(m.id)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-colors hover:bg-secondary ${enabled ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-secondary border-border text-foreground'}`}
              >
                <span className="font-semibold">{m.label}</span>
                {enabled ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
        <div className="p-6 border-t border-border flex justify-end">
          <button
            onClick={handleSave}
            disabled={!selectedLeadId || loading}
            className="px-6 py-3 rounded-xl font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 disabled:opacity-50"
          >
            <Save className="w-4 h-4 inline-block mr-2" />
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLeadSettings;
