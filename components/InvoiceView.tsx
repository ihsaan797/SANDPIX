import React, { useState } from 'react';
import { Invoice, InvoiceStatus, Settings } from '../types';
import { ArrowLeft, Download, Send, Edit, Printer } from 'lucide-react';
import { generatePDF } from '../services/pdfService';
import { generateEmailDraft } from '../services/geminiService';

interface InvoiceViewProps {
  invoice: Invoice;
  settings: Settings;
  onBack: () => void;
  onEdit: (invoice: Invoice) => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice, settings, onBack, onEdit }) => {
  const [downloading, setDownloading] = useState(false);
  const [draftingEmail, setDraftingEmail] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    await generatePDF('invoice-content', `Invoice-${invoice.invoiceNumber}`);
    setDownloading(false);
  };

  const handleSend = async () => {
    setDraftingEmail(true);
    // Generate PDF first
    await generatePDF('invoice-content', `Invoice-${invoice.invoiceNumber}`);
    
    // Generate AI email body
    const emailBody = await generateEmailDraft(invoice);
    
    // Construct mailto link
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from ${settings.businessName}`);
    const body = encodeURIComponent(emailBody + "\n\n(Please attach the downloaded PDF invoice)");
    
    window.location.href = `mailto:${invoice.clientEmail}?subject=${subject}&body=${body}`;
    setDraftingEmail(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Toolbar - Hidden when printing */}
      <div className="print-hide mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 flex items-center gap-2 font-medium">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => onEdit(invoice)}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Edit size={18} /> Edit
          </button>
           <button 
            onClick={handlePrint}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Printer size={18} /> Print
          </button>
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-2 text-maldives-700 bg-maldives-50 hover:bg-maldives-100 rounded-lg flex items-center gap-2 transition-colors border border-maldives-200"
          >
            <Download size={18} /> {downloading ? 'Saving...' : 'Download PDF'}
          </button>
          <button 
            onClick={handleSend}
            disabled={draftingEmail}
            className="px-4 py-2 bg-maldives-600 hover:bg-maldives-700 text-white rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <Send size={18} /> {draftingEmail ? 'Drafting...' : 'Send Invoice'}
          </button>
        </div>
      </div>

      {/* Invoice Content - Visible area that gets captured */}
      <div id="invoice-content" className="bg-white p-12 rounded-xl shadow-xl border border-gray-100 min-h-[1000px] relative overflow-hidden">
        {/* Decorative Wave Top */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-maldives-500 print-show"></div>
        <div className="absolute top-4 left-0 right-0 h-1 bg-sand-400 print-show"></div>

        {/* Header */}
        <div className="flex justify-between items-start mb-16 mt-8">
          <div>
            {settings.logoUrl && (
              <img 
                src={settings.logoUrl} 
                alt="Logo" 
                className="h-20 mb-6 object-contain"
              />
            )}
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight uppercase">{settings.businessName}</h1>
            <h2 className="text-lg text-maldives-600 font-medium tracking-widest mt-1 uppercase">{settings.businessSubtitle}</h2>
            <div className="mt-4 text-gray-500 text-sm leading-relaxed whitespace-pre-line">
              {settings.address}
              <div>{settings.phone}</div>
              <div>{settings.email}</div>
              {settings.gstTin && (
                <div className="mt-2 font-semibold text-gray-600">GST TIN: {settings.gstTin}</div>
              )}
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-3xl font-light text-gray-400 mb-4">INVOICE</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-end gap-4">
                <span className="text-gray-500">Invoice No:</span>
                <span className="font-bold text-gray-800">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-end gap-4">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium text-gray-800">{invoice.date}</span>
              </div>
              <div className="flex justify-end gap-4">
                <span className="text-gray-500">Due Date:</span>
                <span className="font-medium text-gray-800">{invoice.dueDate}</span>
              </div>
              <div className="mt-4 inline-block px-3 py-1 rounded border text-xs font-bold uppercase tracking-wide
                ${invoice.status === InvoiceStatus.PAID ? 'border-green-500 text-green-600 bg-green-50' : 
                  invoice.status === InvoiceStatus.PENDING ? 'border-amber-500 text-amber-600 bg-amber-50' : 'border-gray-300 text-gray-500 bg-gray-50'}"
              >
                {invoice.status}
              </div>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-12 bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h4>
          <h3 className="text-xl font-bold text-gray-900">{invoice.clientName}</h3>
          {invoice.clientAddress && <p className="text-gray-600 mt-1">{invoice.clientAddress}</p>}
          <p className="text-gray-600 mt-1">{invoice.clientEmail}</p>
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 text-sm font-bold text-gray-600 uppercase tracking-wider">Description</th>
              <th className="text-center py-3 text-sm font-bold text-gray-600 uppercase tracking-wider w-24">Qty</th>
              <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase tracking-wider w-32">Rate</th>
              <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase tracking-wider w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="py-4 text-gray-800 font-medium">{item.description}</td>
                <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                <td className="py-4 text-right text-gray-600">{item.rate.toLocaleString()}</td>
                <td className="py-4 text-right text-gray-800 font-bold">{(item.quantity * item.rate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-72 space-y-3">
            <div className="flex justify-between text-gray-600 py-2 border-b border-gray-100">
              <span className="font-medium">Subtotal</span>
              <span>MVR {invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-gray-600 py-2 border-b border-gray-100">
              <span className="font-medium">Tax (8%)</span>
              <span>MVR {invoice.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-maldives-800 pt-2">
              <span>Total</span>
              <span>MVR {invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Footer / Notes */}
        {(invoice.notes) && (
          <div className="border-t border-gray-200 pt-6 text-sm text-gray-600">
            <h5 className="font-bold mb-2">Notes</h5>
            <p>{invoice.notes}</p>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent flex items-end justify-center pb-6 text-xs text-gray-400">
          Thank you for choosing {settings.businessName}
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;