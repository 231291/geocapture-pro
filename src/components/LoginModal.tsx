import React, { useState } from 'react';
import { UserCheck, Shield, Key, User as UserIcon, X, CheckCircle2, Building, Sparkles } from 'lucide-react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  currentUser: User;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  currentUser
}) => {
  const [selectedUser, setSelectedUser] = useState<User>(currentUser);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('field_tech');
  const [newUserDept, setNewUserDept] = useState('Topografía y Geodesia');
  const [isRegisteringNew, setIsRegisteringNew] = useState(false);

  if (!isOpen) return null;

  const handleSelectUserAndLogin = (user: User) => {
    onLogin(user);
    onClose();
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      department: newUserDept,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isOnline: true,
      lat: 18.4861,
      lng: -69.9312,
      accuracy: 3.0,
      lastActive: 'Hace un momento'
    };

    onLogin(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#333333] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#3B82F6] flex items-center justify-center text-white shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-serif italic text-base text-white">Field Login</h3>
              <p className="text-xs text-[#888888]">Surveyor Identity Management</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-[#888888] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Users Accounts List */}
        {!isRegisteringNew ? (
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-[#888888]">
              Select Registered User Account:
            </p>

            <div className="space-y-2">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUserAndLogin(user)}
                  className={`w-full p-3 rounded-md border text-left flex items-center justify-between transition-all cursor-pointer ${
                    currentUser.id === user.id
                      ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-white font-bold shadow-md'
                      : 'bg-[#0D0D0D] border-[#333333] text-[#888888] hover:text-white hover:bg-[#262626]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#333333]"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{user.name}</h4>
                      <p className="text-[11px] text-[#888888]">{user.department}</p>
                      <span className="text-[10px] text-[#3B82F6] font-mono">
                        {user.role === 'field_tech' ? 'Field Surveyor' : 'Field Supervisor'}
                      </span>
                    </div>
                  </div>

                  {currentUser.id === user.id ? (
                    <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-[#888888]" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsRegisteringNew(true)}
              className="w-full py-2.5 px-4 bg-[#0D0D0D] hover:bg-[#262626] text-[#E5E5E5] border border-[#333333] rounded-md text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#3B82F6]" />
              <span>Register New Field Surveyor</span>
            </button>
          </div>
        ) : (
          /* Register New User Form */
          <form onSubmit={handleCreateNewUser} className="space-y-3.5">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#888888] mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="e.g. Laura Bermúdez"
                className="w-full px-3.5 py-2 bg-[#0D0D0D] border border-[#333333] rounded-md text-xs text-white placeholder-[#888888] focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#888888] mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="laura@geocapture.io"
                className="w-full px-3.5 py-2 bg-[#0D0D0D] border border-[#333333] rounded-md text-xs text-white placeholder-[#888888] focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#888888] mb-1">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#333333] rounded-md text-xs text-white"
                >
                  <option value="field_tech">Field Surveyor</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#888888] mb-1">Department</label>
                <input
                  type="text"
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#333333] rounded-md text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRegisteringNew(false)}
                className="py-2.5 px-4 bg-[#0D0D0D] border border-[#333333] text-[#888888] hover:text-white rounded-md text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs uppercase tracking-wider rounded-md"
              >
                Create & Login
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
