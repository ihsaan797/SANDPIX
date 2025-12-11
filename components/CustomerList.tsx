import React, { useState } from 'react';
import { Customer, ViewConfig } from '../types';
import { Plus, Search, Edit, Trash2, User, Building, Phone, MapPin } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  setView: (config: ViewConfig) => void;
  onDelete: (id: string) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, setView, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your client details</p>
        </div>
        <button 
          onClick={() => setView({ view: 'create-customer' })}
          className="bg-maldives-600 hover:bg-maldives-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
        >
          <Plus size={20} /> Add Customer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maldives-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100">
          {filteredCustomers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <User size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No customers found</p>
              <p className="text-sm">Add a new customer to get started</p>
            </div>
          ) : (
            filteredCustomers.map(customer => (
              <div key={customer.id} className="p-6 hover:bg-gray-50 transition-colors group">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-800">{customer.name}</h3>
                      {customer.companyName && (
                        <span className="bg-sand-100 text-sand-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Building size={12} /> {customer.companyName}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-maldives-400"></span>
                        {customer.email}
                      </span>
                      {customer.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={14} /> {customer.phone}
                        </span>
                      )}
                      {customer.address && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} /> {customer.address}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setView({ view: 'edit-customer', customerId: customer.id })}
                      className="p-2 text-gray-500 hover:text-maldives-600 hover:bg-maldives-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this customer?')) {
                          onDelete(customer.id);
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerList;