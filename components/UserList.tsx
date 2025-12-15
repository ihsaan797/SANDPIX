import React, { useState } from 'react';
import { User, ViewConfig, UserRole } from '../types';
import { Plus, Search, Edit, Trash2, Shield, User as UserIcon, Mail } from 'lucide-react';

interface UserListProps {
  users: User[];
  setView: (config: ViewConfig) => void;
  onDelete: (id: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, setView, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 mt-1">Manage system access and permissions</p>
        </div>
        <button
          onClick={() => setView({ view: 'create-user' })}
          className="bg-maldives-600 hover:bg-maldives-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
        >
          <Plus size={20} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maldives-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <UserIcon size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No users found</p>
            </div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors group">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg border-2 border-white shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                           <Mail size={14} /> {user.email}
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                     <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border
                        ${user.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                          user.role === UserRole.EDITOR ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        <Shield size={12} /> {user.role}
                     </span>
                     
                     <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                           onClick={() => setView({ view: 'edit-user', userId: user.id })}
                           className="p-2 text-gray-500 hover:text-maldives-600 hover:bg-maldives-50 rounded-lg transition-colors"
                           title="Edit"
                        >
                           <Edit size={18} />
                        </button>
                        <button
                           onClick={() => {
                              if (window.confirm('Are you sure you want to delete this user?')) {
                                 onDelete(user.id);
                              }
                           }}
                           className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                           title="Delete"
                        >
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;