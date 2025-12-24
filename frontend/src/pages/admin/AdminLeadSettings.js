import React, { useState, useEffect } from 'react';
import { leadAPI, employeeAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Users, ShieldCheck, Save, CheckCircle, XCircle, UserCog } from 'lucide-react';

const ALL_MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'leave', label: 'Leave' },
  { id: 'appeals', label: 'Appeals' },
  { id: 'fines', label: 'Fines' },
];

const AdminLeadSettings = () => {
  const [employees, setEmployees] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      loadPermissions();
    }
  }, [selectedEmployeeId]);

  const loadEmployees = async () => {
    try {
      const empData = await employeeAPI.getAll();
      // Get all employees (not admin)
      setEmployees(empData.filter((e) => e.role !== 'ADMIN'));
      // Get current leads
      setLeads(empData.filter((e) => e.role === 'LEAD'));
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setInitialLoading(false);
    }
  };

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const perms = await leadAPI.getPermissions(selectedEmployeeId);
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

  const handleMakeLead = async (empId) => {
    try {
      await employeeAPI.update(empId, { role: 'LEAD' });
      await loadEmployees();
      toast.success('Employee promoted to Lead!');
    } catch (error) {
      toast.error('Failed to update employee role');
    }
  };

  const handleRemoveLead = async (empId) => {
    try {
      await employeeAPI.update(empId, { role: 'EMPLOYEE' });
      await loadEmployees();
      toast.success('Lead demoted to Employee');
    } catch (error) {
      toast.error('Failed to update employee role');
    }
  };

  const handleSave = async () => {
    if (!selectedEmployeeId) {
      toast.error('Select an employee first');
      return;
    }
    setLoading(true);
    try {
      await leadAPI.updatePermissions(selectedEmployeeId, modules);
      toast.success('Permissions updated successfully');
    } catch (error) {
      toast.error('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

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
          <h1 className="text-3xl font-bold text-foreground">Lead Management</h1>
          <p className="text-muted-foreground mt-1">Assign leads and manage their permissions</p>
        </div>
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>

      {/* Current Leads Section */}
      <div className="bg-card border border-border rounded-3xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/30">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            Current Leads ({leads.length})
          </h2>
        </div>
        <div className="p-6">
          {leads.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No leads assigned yet. Select an employee below to make them a lead.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {leads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.designation}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveLead(lead.id)}
                    className="text-xs text-destructive hover:underline font-bold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assign New Lead */}
      <div className="bg-card border border-border rounded-3xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/30">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" />
            Assign Lead Permissions
          </h2>
        </div>
        <div className="p-6">
          <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase">Select Employee</label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none text-foreground"
            data-testid="employee-select"
          >
            <option value="">Select an employee...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.username}) - {emp.role === 'LEAD' ? '★ Lead' : 'Employee'}
              </option>
            ))}
          </select>
          
          {selectedEmployee && selectedEmployee.role !== 'LEAD' && (
            <button
              onClick={() => handleMakeLead(selectedEmployeeId)}
              className="mt-4 px-6 py-2 bg-success text-success-foreground rounded-xl font-bold text-sm hover:bg-success/90 transition-colors"
            >
              Promote to Lead
            </button>
          )}
        </div>
      </div>

      {/* Module Permissions */}
      <div className="bg-card border border-border rounded-3xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/30">
          <h2 className="font-bold text-foreground">
            Module Permissions {selectedEmployee ? `for ${selectedEmployee.name}` : ''}
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_MODULES.map((m) => {
            const enabled = modules.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleModule(m.id)}
                disabled={!selectedEmployeeId}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-colors hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed ${enabled ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-secondary border-border text-foreground'}`}
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
            disabled={!selectedEmployeeId || loading}
            className="px-6 py-3 rounded-xl font-bold gradient-primary text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 active:scale-95 transition-all"
            data-testid="save-permissions-btn"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLeadSettings;
