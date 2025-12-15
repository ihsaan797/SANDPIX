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
import { Invoice, InvoiceStatus, ViewConfig, Customer, Settings, User, UserRole } from './types';
import { Layout, Users, Settings as SettingsIcon, FileText, BarChart3, Shield, Loader2 } from 'lucide-react';
import { supabase } from './services/supabaseClient';

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

  // Load data from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Fetching data from Supabase...");
        
        // Fetch Invoices
        const { data: invoicesData, error: invError } = await supabase
          .from('invoices')
          .select('*');
        if (invError) console.error('Error fetching invoices:', invError);
        else if (invoicesData) setInvoices(invoicesData);

        // Fetch Customers
        const { data: customersData, error: custError } = await supabase
          .from('customers')
          .select('*');
        if (custError) console.error('Error fetching customers:', custError);
        else if (customersData) setCustomers(customersData);

        // Fetch Users
        const { data: usersData, error: userError } = await supabase
          .from('users')
          .select('*');
        if (userError) console.error('Error fetching users:', userError);
        else if (usersData) setUsers(usersData);

        // Fetch Settings (Single Row)
        const { data: settingsData, error: setError } = await supabase
          .from('settings')
          .select('*')
          .limit(1)
          .maybeSingle(); // Use maybeSingle to avoid error if table is empty
        
        if (setError) {
           console.error('Error fetching settings:', setError);
        } else if (settingsData) {
           // Remove database specific fields if any, though interface match should handle it
           setSettings(settingsData);
        }
      } catch (error) {
        console.error('Unexpected error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveInvoice = async (invoice: Invoice) => {
    // Optimistic Update
    setInvoices(prev => {
      const exists = prev.find(i => i.id === invoice.id);
      if (exists) {
        return prev.map(i => i.id === invoice.id ? invoice : i);
      } else {
        return [invoice, ...prev];
      }
    });
    setViewConfig({ view: 'view', invoiceId: invoice.id });

    // Supabase
    const { error } = await supabase.from('invoices').upsert(invoice);
    if (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice to cloud. Please check connection.');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    // Optimistic Update
    setInvoices(prev => prev.filter(i => i.id !== id));
    
    // Supabase
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleSaveCustomer = async (customer: Customer) => {
    // Optimistic Update
    setCustomers(prev => {
      const exists = prev.find(c => c.id === customer.id);
      if (exists) {
        return prev.map(c => c.id === customer.id ? customer : c);
      } else {
        return [...prev, customer];
      }
    });
    setViewConfig({ view: 'customers' });

    // Supabase
    const { error } = await supabase.from('customers').upsert(customer);
    if (error) {
       console.error('Error saving customer:', error);
       alert('Failed to save customer to cloud.');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) console.error('Error deleting customer:', error);
  };

  const handleSaveUser = async (user: User) => {
    setUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      if (exists) {
        return prev.map(u => u.id === user.id ? user : u);
      } else {
        return [...prev, user];
      }
    });
    setViewConfig({ view: 'users' });

    const { error } = await supabase.from('users').upsert(user);
    if (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) console.error('Error deleting user:', error);
  };

  const handleSaveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    // Force ID 1 to maintain singleton nature in DB
    const settingsPayload = { ...newSettings, id: 1 }; 
    const { error } = await supabase.from('settings').upsert(settingsPayload);
    
    if (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    }
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