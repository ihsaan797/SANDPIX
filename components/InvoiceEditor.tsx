import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, InvoiceStatus, ViewConfig, Customer } from '../types';
import { ArrowLeft, Plus, Trash2, Sparkles, Loader2, Save, UserCheck } from 'lucide-react';
import { suggestInvoiceItems } from '../services/geminiService';

interface InvoiceEditorProps {
  invoice?: Invoice | null;
  customers?: Customer[];
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ invoice, customers = [], onSave, onCancel }) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  const [formData, setFormData] = useState<Invoice>({
    id: crypto.randomUUID(),
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 }],
    status: InvoiceStatus.DRAFT,
    notes: '',
    subtotal: 0,
    tax: 0,
    total: 0
  });

  useEffect(() => {
    if (invoice) {
      setFormData(invoice);
    }
  }, [invoice]);

  // Recalculate totals whenever items change
  useEffect(() => {
    const sub = formData.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
    const taxAmt = sub * 0.08; // 8% GST assumption for Maldives
    setFormData(prev => ({
      ...prev,
      subtotal: sub,
      tax: taxAmt,
      total: sub + taxAmt
    }));
  }, [formData.items]);

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        clientName: customer.companyName ? `${customer.companyName} (${customer.name})` : customer.name,
        clientEmail: customer.email,
        clientAddress: customer.address
      }));
    }
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 }]
    }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleMagicDraft = async () => {
    if (!aiPrompt.trim()) return;
    setLoadingAI(true);
    try {
      const suggestedItems = await suggestInvoiceItems(aiPrompt);
      if (suggestedItems.length > 0) {
        setFormData(prev => ({
          ...prev,
          items: suggestedItems // Replace items or append? Replacing is cleaner for "drafting"
        }));
      }
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-sand-50">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {invoice ? 'Edit Invoice' : 'New Invoice'}
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
              <Save size={18} /> Save Invoice
            </button>
        </div>
      </div>

      <div className="p-8">
        {/* AI Section */}
        <div className="mb-8 bg-gradient-to-r from-maldives-50 to-sand-50 p-6 rounded-xl border border-maldives-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm text-maldives-600 mt-1">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-800 mb-1">AI Magic Draft</h3>
              <p className="text-xs text-gray-500 mb-3">Describe the services provided (e.g., "Wedding photography package 3 days + drone shots"), and we'll draft the line items for you.</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., Full day resort photoshoot with 20 edited photos"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-maldives-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleMagicDraft()}
                />
                <button 
                  onClick={handleMagicDraft}
                  disabled={loadingAI || !aiPrompt}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingAI ? <Loader2 size={16} className="animate-spin" /> : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input 
                  type="text" 
                  value={formData.invoiceNumber}
                  onChange={e => setFormData({...formData, invoiceNumber: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maldives-500 outline-none"
                />
              </div>

              {/* Customer Selection */}
              {customers.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <UserCheck size={12} /> Auto-fill from Customer
                   </label>
                   <select 
                     onChange={handleCustomerSelect} 
                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maldives-500 outline-none text-sm bg-white"
                     defaultValue=""
                   >
                     <option value="" disabled>Select a customer...</option>
                     {customers.map(c => (
                       <option key={c.id} value={c.id}>{c.name} {c.companyName ? `(${c.companyName})` : ''}</option>
                     ))}
                   </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maldives-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
                <input 
                  type="email" 
                  value={formData.clientEmail}
                  onChange={e => setFormData({...formData, clientEmail: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maldives-500 outline-none"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Address</label>
                <input 
                  type="text" 
                  value={formData.clientAddress || ''}
                  onChange={e => setFormData({...formData, clientAddress: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maldives-500 outline-none"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maldives-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maldives-500 outline-none"
                  />
                </div>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as InvoiceStatus})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maldives-500 outline-none bg-white"
                >
                  {Object.values(InvoiceStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Line Items</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 px-2">
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-3">Rate (MVR)</div>
                <div className="col-span-1"></div>
              </div>
              
              {formData.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-6">
                    <input 
                      type="text" 
                      value={item.description}
                      onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="Service description"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maldives-500 outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={e => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maldives-500 outline-none"
                    />
                  </div>
                  <div className="col-span-3">
                    <input 
                      type="number" 
                      min="0"
                      value={item.rate}
                      onChange={e => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maldives-500 outline-none"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center pt-2">
                    <button 
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

              <button 
                type="button"
                onClick={addItem}
                className="mt-2 text-sm font-medium text-maldives-600 hover:text-maldives-700 flex items-center gap-1"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>MVR {formData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (8%)</span>
                <span>MVR {formData.tax.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between text-xl font-bold text-gray-800">
                <span>Total</span>
                <span>MVR {formData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceEditor;