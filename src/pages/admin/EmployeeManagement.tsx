import React, { useState, useEffect, useRef } from 'react';
import { Employee, Role } from '@/types';
import { storage } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Edit2, Trash2, X, Camera, IdCard } from 'lucide-react';
import { toast } from 'sonner';

const EmployeeManagement: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    username: '',
    password: '',
    designation: '',
    salary: 0,
    role: 'EMPLOYEE' as Role,
    profilePic: ''
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const emps = await storage.getEmployees();
    setEmployees(emps.filter(e => e.role === 'EMPLOYEE'));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePic: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        // Update existing employee
        const updatedEmp: Employee = {
          ...editingEmployee,
          ...formData,
          password: formData.password || editingEmployee.password
        } as Employee;
        
        const success = await storage.updateEmployee(updatedEmp);
        if (success) {
          toast.success('Employee updated successfully');
        } else {
          toast.error('Failed to update employee');
          return;
        }
      } else {
        // Create new employee
        // Set password to username if not provided
        const password = formData.password || formData.username;
        
        const newEmp: Employee = {
          id: Math.random().toString(36).substr(2, 9),
          employeeId: formData.employeeId || undefined,
          name: formData.name,
          username: formData.username,
          password: password,
          designation: formData.designation,
          salary: formData.salary,
          role: formData.role,
          profilePic: formData.profilePic || undefined,
          joiningDate: new Date().toISOString().split('T')[0],
          status: 'active',
          allowedModules: ['dashboard', 'attendance', 'leave', 'fines']
        };
        
        const success = await storage.addEmployee(newEmp);
        if (success) {
          toast.success('Employee created successfully');
        } else {
          toast.error('Failed to create employee');
          return;
        }
      }
      
      loadEmployees();
      setModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save employee');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        const success = await storage.deleteEmployee(id);
        if (success) {
          loadEmployees();
          toast.success('Employee removed successfully');
        } else {
          toast.error('Failed to remove employee');
        }
      } catch (error) {
        toast.error('Failed to remove employee');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      name: '',
      username: '',
      password: '',
      designation: '',
      salary: 0,
      role: 'EMPLOYEE',
      profilePic: ''
    });
    setEditingEmployee(null);
  };

  const openEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      employeeId: emp.employeeId || '',
      name: emp.name,
      username: emp.username,
      password: '',
      designation: emp.designation,
      salary: emp.salary,
      role: emp.role,
      profilePic: emp.profilePic || ''
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Team Directory</h2>
          <p className="text-muted-foreground text-sm">Manage your workforce</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="gradient-primary text-primary-foreground p-3 px-6 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform"
        >
          <UserPlus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Employee</span>
        </button>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map(emp => (
          <div key={emp.id} className="bg-card rounded-3xl border border-border p-5 shadow-card hover:shadow-lg transition-shadow relative group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-xl overflow-hidden">
                {emp.profilePic ? (
                  <img src={emp.profilePic} alt={emp.name} className="w-full h-full object-cover" />
                ) : (
                  emp.name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground truncate">{emp.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{emp.designation}</p>
                {emp.employeeId && (
                  <p className="text-xs text-primary font-bold flex items-center gap-1 mt-0.5">
                    <IdCard className="w-3 h-3" />
                    {emp.employeeId}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEdit(emp)}
                  className="p-2 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(emp.id, emp.name)}
                  className="p-2 bg-destructive/10 text-destructive rounded-lg text-sm hover:bg-destructive/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border text-sm">
              <div>
                <p className="text-muted-foreground">Salary</p>
                <p className="font-bold text-foreground">₨ {emp.salary.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Joined</p>
                <p className="font-bold text-foreground">{emp.joiningDate}</p>
              </div>
            </div>
          </div>
        ))}
        {employees.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-20" />
            No employees found. Add one to get started.
          </div>
        )}
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl animate-scale-in border border-border">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-bold text-foreground">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              {/* Profile Picture */}
              <div className="flex justify-center mb-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-2xl bg-secondary border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer overflow-hidden group"
                >
                  {formData.profilePic ? (
                    <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <Camera className="w-8 h-8 mb-1" />
                      <span className="text-[10px] font-bold uppercase">Add Photo</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
              </div>
              
              {/* Employee ID */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase flex items-center gap-1">
                  <IdCard className="w-3 h-3" />
                  Employee ID
                </label>
                <input
                  className="w-full px-4 py-3 bg-secondary border-0 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                  value={formData.employeeId}
                  onChange={e => setFormData({...formData, employeeId: e.target.value})}
                  placeholder="e.g., EMP-001"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase">Full Name</label>
                  <input
                    required
                    className="w-full px-4 py-3 bg-secondary border-0 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase">Username</label>
                  <input
                    required
                    className="w-full px-4 py-3 bg-secondary border-0 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase">Password</label>
                <input
                    type="password"
                    className="w-full px-4 py-3 bg-secondary border-0 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder={editingEmployee ? 'Leave empty to keep current' : 'Defaults to username'}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase">Designation</label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-secondary border-0 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                    value={formData.designation}
                    onChange={e => setFormData({...formData, designation: e.target.value})}
                  >
                    <option value="">Select Designation</option>
                    <option value="Digital Commerce Trainee">Digital Commerce Trainee</option>
                    <option value="Digital Commerce Probationer">Digital Commerce Probationer</option>
                    <option value="Digital Commerce Associate">Digital Commerce Associate</option>
                    <option value="Graphic Designer">Graphic Designer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Software Engineer">Software Engineer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase">Salary (PKR)</label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-3 bg-secondary border-0 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                    value={formData.salary}
                    onChange={e => setFormData({...formData, salary: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3.5 font-bold text-muted-foreground border border-border rounded-xl hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3.5 gradient-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20"
                  >
                    {editingEmployee ? 'Save Changes' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default EmployeeManagement;