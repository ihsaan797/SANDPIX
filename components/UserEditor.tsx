import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { ArrowLeft, Save, User as UserIcon, Mail, Shield } from 'lucide-react';

interface UserEditorProps {
  user?: User | null;
  onSave: (user: User) => void;
  onCancel: () => void;
}

const UserEditor: React.FC<UserEditorProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState<User>({
    id: crypto.randomUUID(),
    name: '',
    email: '',
    role: UserRole.VIEWER
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-sand-50">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {user ? 'Edit User' : 'New User'}
          </h2>
        </div>
        <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-maldives-600 hover:bg-maldives-700 text-white rounded-lg flex items-center gap-2 shadow-sm"
            >
              <Save size={18} /> Save
            </button>
        </div>
      </div>

      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <UserIcon size={16} className="text-gray-400" /> Full Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Mariyam Naaz"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-maldives-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Mail size={16} className="text-gray-400" /> Email Address <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="user@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-maldives-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Shield size={16} className="text-gray-400" /> Role
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
               {Object.values(UserRole).map(role => (
                  <div
                     key={role}
                     onClick={() => setFormData({...formData, role})}
                     className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                        formData.role === role
                        ? 'border-maldives-500 bg-maldives-50 text-maldives-900 ring-1 ring-maldives-500'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                     }`}
                  >
                     <span className="font-bold">{role}</span>
                     <span className="text-xs text-center opacity-70 leading-tight">
                        {role === UserRole.ADMIN ? 'Full access to all settings and data' :
                         role === UserRole.EDITOR ? 'Can create and edit invoices' :
                         'Read-only access to view invoices'}
                     </span>
                  </div>
               ))}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UserEditor;