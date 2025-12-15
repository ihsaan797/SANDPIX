import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import InvoiceEditor from './components/InvoiceEditor';
import InvoiceView from './components/InvoiceView';
import InvoiceList from './components/InvoiceList';
import CustomerList from './components/CustomerList';
import CustomerEditor from './components/CustomerEditor';
import SettingsEditor from './components/SettingsEditor';
import Reports from './components/Reports';
import UserList from './components/UserList';
import UserEditor from './components/UserEditor';
import { Invoice, ViewConfig, Customer, Settings, User } from './types';
import { Layout, Users, Settings as SettingsIcon, FileText, BarChart3, Shield, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings>({
    businessName: 'SANDPIX MALDIVES',
    businessSubtitle: '',
    address: "Male', Maldives",
    email: 'hello@sandpixmaldives.com',
    phone: '+960 777-7777',
    gstTin: ''
  });
  const [viewConfig, setViewConfig] = useState<ViewConfig>({ view: 'dashboard' });

  // Load data from LocalStorage on mount
  useEffect(() => {
    const loadLocalData = () => {
      try {
        const localInvoices = localStorage.getItem('sandpix_invoices');
        const localCustomers = localStorage.getItem('sandpix_customers');
        const localUsers = localStorage.getItem('sandpix_users');
        const localSettings = localStorage.getItem('sandpix_settings');

        if (localInvoices) setInvoices(JSON.parse(localInvoices));
        if (localCustomers) setCustomers(JSON.parse(localCustomers));
        if (localUsers) setUsers(JSON.parse(localUsers));
        if (localSettings) setSettings(JSON.parse(localSettings));
      } catch (e) {
        console.error("Error loading local data", e);
      } finally {
        setLoading(false);
      }
    };
    
    loadLocalData();
  }, []);

  const handleSaveInvoice = (invoice: Invoice) => {
    const exists = invoices.find(i => i.id === invoice.id);
    let updatedInvoices: Invoice[];
    
    if (exists) {
      updatedInvoices = invoices.map(i => i.id === invoice.id ? invoice : i);
    } else {
      updatedInvoices = [invoice, ...invoices];
    }
    
    setInvoices(updatedInvoices);
    localStorage.setItem('sandpix_invoices', JSON.stringify(updatedInvoices));
    setViewConfig({ view: 'view', invoiceId: invoice.id });
  };

  const handleDeleteInvoice = (id: string) => {
    const updatedInvoices = invoices.filter(i => i.id !== id);
    setInvoices(updatedInvoices);
    localStorage.setItem('sandpix_invoices', JSON.stringify(updatedInvoices));
  };

  const handleSaveCustomer = (customer: Customer) => {
    const exists = customers.find(c => c.id === customer.id);
    let updatedCustomers: Customer[];

    if (exists) {
      updatedCustomers = customers.map(c => c.id === customer.id ? customer : c);
    } else {
      updatedCustomers = [...customers, customer];
    }

    setCustomers(updatedCustomers);
    localStorage.setItem('sandpix_customers', JSON.stringify(updatedCustomers));
    setViewConfig({ view: 'customers' });
  };

  const handleDeleteCustomer = (id: string) => {
    const updatedCustomers = customers.filter(c => c.id !== id);
    setCustomers(updatedCustomers);
    localStorage.setItem('sandpix_customers', JSON.stringify(updatedCustomers));
  };

  const handleSaveUser = (user: User) => {
    const exists = users.find(u => u.id === user.id);
    let updatedUsers: User[];

    if (exists) {
      updatedUsers = users.map(u => u.id === user.id ? user : u);
    } else {
      updatedUsers = [...users, user];
    }

    setUsers(updatedUsers);
    localStorage.setItem('sandpix_users', JSON.stringify(updatedUsers));
    setViewConfig({ view: 'users' });
  };

  const handleDeleteUser = (id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('sandpix_users', JSON.stringify(updatedUsers));
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('sandpix_settings', JSON.stringify(newSettings));
  };

  const currentInvoice = viewConfig.invoiceId 
    ? invoices.find(i => i.id === viewConfig.invoiceId) 
    : undefined;

  const currentCustomer = viewConfig.customerId
    ? customers.find(c => c.id === viewConfig.customerId)
    : undefined;

  const currentUser = viewConfig.userId
    ? users.find(u => u.id === viewConfig.userId)
    : undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-maldives-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading your business data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Mobile Responsive */}
      <aside className="print-hide w-full md:w-64 bg-gray-900 text-white flex-shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-maldives-500 rounded-lg flex items-center justify-center">
             <Layout className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight">SANDPIX MALDIVES</span>
        </div>
        
        <nav className="px-4 py-2 space-y-2">
          <button 
            onClick={() => setViewConfig({ view: 'dashboard' })}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              viewConfig.view === 'dashboard' ? 'bg-gray-800 text-maldives-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Layout size={18} /> Dashboard
          </button>

          <button 
            onClick={() => setViewConfig({ view: 'invoices' })}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              viewConfig.view === 'invoices' || viewConfig.view === 'view' && !viewConfig.customerId ? 'bg-gray-800 text-maldives-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <FileText size={18} /> Invoices
          </button>

          <button 
            onClick={() => setViewConfig({ view: 'customers' })}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              ['customers', 'create-customer', 'edit-customer'].includes(viewConfig.view) ? 'bg-gray-800 text-maldives-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Users size={18} /> Customers
          </button>

          <button 
            onClick={() => setViewConfig({ view: 'reports' })}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              viewConfig.view === 'reports' ? 'bg-gray-800 text-maldives-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <BarChart3 size={18} /> Reports
          </button>

          <button 
            onClick={() => setViewConfig({ view: 'users' })}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              ['users', 'create-user', 'edit-user'].includes(viewConfig.view) ? 'bg-gray-800 text-maldives-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Shield size={18} /> Users
          </button>

          <button 
            onClick={() => setViewConfig({ view: 'settings' })}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              viewConfig.view === 'settings' ? 'bg-gray-800 text-maldives-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <SettingsIcon size={18} /> Settings
          </button>

          <div className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Actions
          </div>
          <button 
             onClick={() => setViewConfig({ view: 'create' })}
             className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              viewConfig.view === 'create' ? 'bg-gray-800 text-maldives-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Create Invoice
          </button>
        </nav>

        <div className="absolute bottom-0 w-full md:w-64 p-6 border-t border-gray-800">
           <p className="text-xs text-gray-500">© 2024 SandPix Maldives</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 h-screen overflow-y-auto">
        <div className="p-6 md:p-12 max-w-7xl mx-auto">
          {viewConfig.view === 'dashboard' && (
            <Dashboard invoices={invoices} setView={setViewConfig} />
          )}

          {viewConfig.view === 'invoices' && (
            <InvoiceList 
              invoices={invoices} 
              setView={setViewConfig} 
              onDelete={handleDeleteInvoice} 
            />
          )}

          {viewConfig.view === 'create' && (
            <InvoiceEditor 
              onSave={handleSaveInvoice}
              onCancel={() => setViewConfig({ view: 'dashboard' })}
              customers={customers}
            />
          )}

          {viewConfig.view === 'edit' && currentInvoice && (
            <InvoiceEditor 
              invoice={currentInvoice}
              onSave={handleSaveInvoice}
              onCancel={() => setViewConfig({ view: 'view', invoiceId: currentInvoice.id })}
              customers={customers}
            />
          )}

          {viewConfig.view === 'view' && currentInvoice && (
            <InvoiceView 
              invoice={currentInvoice}
              settings={settings}
              onBack={() => setViewConfig({ view: 'invoices' })}
              onEdit={() => setViewConfig({ view: 'edit', invoiceId: currentInvoice.id })}
            />
          )}

          {viewConfig.view === 'reports' && (
            <Reports invoices={invoices} />
          )}

          {viewConfig.view === 'users' && (
            <UserList 
              users={users}
              setView={setViewConfig}
              onDelete={handleDeleteUser}
            />
          )}

          {viewConfig.view === 'create-user' && (
             <UserEditor 
              onSave={handleSaveUser}
              onCancel={() => setViewConfig({ view: 'users' })}
            />
          )}

          {viewConfig.view === 'edit-user' && currentUser && (
             <UserEditor 
              user={currentUser}
              onSave={handleSaveUser}
              onCancel={() => setViewConfig({ view: 'users' })}
            />
          )}

          {viewConfig.view === 'customers' && (
            <CustomerList 
              customers={customers}
              setView={setViewConfig}
              onDelete={handleDeleteCustomer}
            />
          )}

          {viewConfig.view === 'create-customer' && (
            <CustomerEditor 
              onSave={handleSaveCustomer}
              onCancel={() => setViewConfig({ view: 'customers' })}
            />
          )}

          {viewConfig.view === 'edit-customer' && currentCustomer && (
             <CustomerEditor 
              customer={currentCustomer}
              onSave={handleSaveCustomer}
              onCancel={() => setViewConfig({ view: 'customers' })}
            />
          )}

          {viewConfig.view === 'settings' && (
            <SettingsEditor 
              settings={settings}
              onSave={handleSaveSettings}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;