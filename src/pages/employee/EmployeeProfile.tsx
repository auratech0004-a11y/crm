import React, { useState, useRef } from 'react';
import { Employee } from '@/types';
import { storage } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, User, Phone, Mail, MapPin, Save, IdCard } from 'lucide-react';
import { toast } from 'sonner';

const EmployeeProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || `${user?.username}@ar-hr.com`,
    address: user?.address || ''
  });
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    const allEmps = await storage.getEmployees();
    const updated: Employee = {
      ...user,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      profilePic: profilePic || undefined
    };
    
    const newAll = allEmps.map(e => e.id === user.id ? updated : e);
    // Assuming storage has a setEmployees method or we update via API
    updateUser(updated);
    toast.success('Profile Updated Successfully!');
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up pb-10">
      <div className="flex flex-col items-center gap-6">
        <div className="relative group">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 bg-primary/10 rounded-full overflow-hidden border-4 border-card shadow-2xl relative flex items-center justify-center cursor-pointer"
          >
            {profilePic ? (
              <img src={profilePic} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl font-black text-primary">{user.name.charAt(0)}</span>
            )}
            <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-10 h-10 gradient-primary text-primary-foreground rounded-full flex items-center justify-center border-4 border-card cursor-pointer hover:scale-110 transition-transform"
          >
            <Camera className="w-4 h-4" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-black text-foreground">{user.name}</h2>
          <p className="text-primary font-bold uppercase tracking-widest text-xs mt-1">{user.designation}</p>
          {user.employeeId && (
            <p className="text-muted-foreground text-sm mt-2 flex items-center justify-center gap-1">
              <IdCard className="w-4 h-4" />
              {user.employeeId}
            </p>
          )}
        </div>
      </div>
      <div className="bg-card border border-border rounded-3xl p-8 shadow-card space-y-6">
        <h3 className="text-xl font-black text-foreground flex items-center gap-3">
          <User className="w-6 h-6 text-primary" />
          Personal Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Full Name</label>
            <input
              className="w-full bg-secondary border border-border rounded-2xl px-5 py-4 outline-none focus:border-primary text-foreground font-bold"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 flex items-center gap-2">
                <Phone className="w-3 h-3" />
                Phone Number
              </label>
              <input
                className="w-full bg-secondary border border-border rounded-2xl px-5 py-4 outline-none focus:border-primary text-foreground font-bold"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="(92) 300 1234567"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 flex items-center gap-2">
                <Mail className="w-3 h-3" />
                Email Address
              </label>
              <input
                className="w-full bg-secondary border border-border rounded-2xl px-5 py-4 outline-none focus:border-primary text-foreground font-bold"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              Home Address
            </label>
            <textarea
              className="w-full bg-secondary border border-border rounded-2xl px-5 py-4 outline-none focus:border-primary text-foreground font-bold h-24 resize-none"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder="Enter your address"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="w-full py-5 gradient-primary text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all mt-6 flex items-center justify-center gap-3"
        >
          <Save className="w-5 h-5" />
          SAVE PROFILE CHANGES
        </button>
      </div>
      <div className="bg-card border border-border rounded-3xl p-8 shadow-card">
        <div className="flex justify-between items-center text-foreground font-bold">
          <span>Employment Status</span>
          <span className="text-success px-4 py-1 bg-success/10 rounded-full text-xs uppercase tracking-widest border border-success/20">Active</span>
        </div>
        <div className="flex justify-between items-center text-foreground font-bold mt-4 pt-4 border-t border-border">
          <span>Joined A.R HR</span>
          <span className="text-muted-foreground text-sm">{user.joiningDate}</span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;