import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import InvoiceEditor from './components/InvoiceEditor';
import InvoiceView from './components/InvoiceView';
import InvoiceList from './components/InvoiceList';
import CustomerList from './components/CustomerList';
import CustomerEditor from './components/CustomerEditor';
import SettingsEditor from './components/SettingsEditor';
import Reports from './components/Reports';
import { Invoice, InvoiceStatus, ViewConfig, Customer, Settings } from './types';
import { Layout, Users, Settings as SettingsIcon, FileText, BarChart3 } from 'lucide-react';

const INVOICE_STORAGE_KEY = 'sandpix_invoices';
const CUSTOMER_STORAGE_KEY = 'sandpix_customers';
const SETTINGS_STORAGE_KEY = 'sandpix_settings';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<Settings>({
    businessName: 'SANDPIX MALDIVES',
    businessSubtitle: '',
    address: "Male', Maldives",
    email: 'hello@sandpixmaldives.com',
    phone: '+960 777-7777',
    gstTin: ''
  });
  const [viewConfig, setViewConfig] = useState<ViewConfig>({ view: 'dashboard' });

  // Load from local storage on mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    } else {
      // Dummy data for first run
      setInvoices([
        {
          id: '1',
          invoiceNumber: 'INV-2024-001',
          clientName: 'Coco Bodu Hithi',
          clientEmail: 'billing@cococollection.com',
          date: '2024-05-10',
          dueDate: '2024-05-24',
          items: [
            { id: 'a1', description: 'Drone Videography - Sunset Villa', quantity: 2, rate: 4500 },
            { id: 'a2', description: 'Photo Editing Service', quantity: 1, rate: 3000 }
          ],
          subtotal: 12000,
          tax: 960,
          total: 12960,
          status: InvoiceStatus.PAID
        }
      ]);
    }

    const savedCustomers = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      // Dummy customers
      setCustomers([
        {
          id: 'c1',
          name: 'Ahmed Niyaz',
          companyName: 'Soneva Jani',
          email: 'ahmed@soneva.com',
          phone: '+960 7771234',
          address: 'Medhufaru Island, Noonu Atoll'
        }
      ]);
    }

    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleSaveInvoice = (invoice: Invoice) => {
    setInvoices(prev => {
      const exists = prev.find(i => i.id === invoice.id);
      if (exists) {
        return prev.map(i => i.id === invoice.id ? invoice : i);
      } else {
        return [invoice, ...prev];
      }
    });
    setViewConfig({ view: 'view', invoiceId: invoice.id });
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const handleSaveCustomer = (customer: Customer) => {
    setCustomers(prev => {
      const exists = prev.find(c => c.id === customer.id);
      if (exists) {
        return prev.map(c => c.id === customer.id ? customer : c);
      } else {
        return [...prev, customer];
      }
    });
    setViewConfig({ view: 'customers' });
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const currentInvoice = viewConfig.invoiceId 
    ? invoices.find(i => i.id === viewConfig.invoiceId) 
    : undefined;

  const currentCustomer = viewConfig.customerId
    ? customers.find(c => c.id === viewConfig.customerId)
    : undefined;

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
              onSave={setSettings}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;