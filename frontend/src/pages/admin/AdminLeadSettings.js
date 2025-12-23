import React, { useState, useEffect } from 'react';
import { leadAPI, employeeAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Users, ShieldCheck, Save, CheckCircle, XCircle } from 'lucide-react';

const ALL_MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'leave', label: 'Leave' },
  { id: 'appeals', label: 'Appeals' },
  { id: 'fines', label: 'Fines' },
];

const AdminLeadSettings = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    if (selectedLeadId) {
      loadPermissions();
    }
  }, [selectedLeadId]);

  const loadLeads = async () => {
    try {
      const empData = await employeeAPI.getAll();
      setLeads(empData.filter((e) => e.role === 'LEAD'));
    } catch (error) {
      toast.error('Failed to load leads');
    } finally {
      setInitialLoading(false);
    }
  };

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const perms = await leadAPI.getPermissions(selectedLeadId);
      setModules(perms?.modules || []);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (id) => {
    setModules((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    if (!selectedLeadId) {
      toast.error('Select a lead first');
      return;
    }
    setLoading(true);
    try {
      await leadAPI.updatePermissions(selectedLeadId, modules);
      toast.success('Lead permissions updated');
    } catch (error) {
      toast.error('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up" data-testid="admin-lead-settings">
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
            data-testid="lead-select"
          >
            <option value="">Select a lead...</option>
            {leads.map((l) => (
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
          {ALL_MODULES.map((m) => {
            const enabled = modules.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleModule(m.id)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-colors hover:bg-secondary ${enabled ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-secondary border-border text-foreground'}`}
                data-testid={`module-${m.id}`}
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
            className="px-6 py-3 rounded-xl font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 disabled:opacity-50 flex items-center gap-2"
            data-testid="save-lead-permissions-btn"
          >
            <Save className="w-4 h-4" />
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLeadSettings;
