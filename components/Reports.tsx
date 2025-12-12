import React, { useState, useMemo } from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { Printer, Calendar, DollarSign, TrendingUp, CreditCard, PieChart, FileText } from 'lucide-react';

interface ReportsProps {
  invoices: Invoice[];
}

const Reports: React.FC<ReportsProps> = ({ invoices }) => {
  // Default to first day of current month and today
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const reportData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set end date to end of day to include invoices on that day
    end.setHours(23, 59, 59, 999);

    const filtered = invoices.filter(inv => {
      const d = new Date(inv.date);
      // Normalize time for comparison
      const dTime = d.getTime();
      return dTime >= start.getTime() && dTime <= end.getTime();
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalInvoiced = filtered.reduce((sum, inv) => sum + inv.total, 0);
    const totalReceived = filtered
      .filter(i => i.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + inv.total, 0);
    const totalPending = filtered
      .filter(i => i.status === InvoiceStatus.PENDING || i.status === InvoiceStatus.OVERDUE)
      .reduce((sum, inv) => sum + inv.total, 0);
    const totalTax = filtered.reduce((sum, inv) => sum + inv.tax, 0);
    
    // Count status breakdown
    const statusCounts = filtered.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { filtered, totalInvoiced, totalReceived, totalPending, totalTax, statusCounts };
  }, [invoices, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Header & Controls */}
      <div className="mb-8 print-hide">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Financial Reports</h1>
            <p className="text-gray-500 mt-1">Generate revenue reports based on date range</p>
          </div>
          <button 
            onClick={handlePrint}
            className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <Printer size={18} /> Print Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" /> Start Date
              </label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maldives-500 outline-none"
              />
            </div>
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" /> End Date
              </label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maldives-500 outline-none"
              />
            </div>
            <div className="flex-1 text-right text-sm text-gray-500 pb-2">
              Showing records from <span className="font-semibold text-gray-900">{startDate}</span> to <span className="font-semibold text-gray-900">{endDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Report Content */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
        
        {/* Report Header (Print Only) */}
        <div className="hidden print-show mb-8 text-center border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Financial Report</h1>
          <p className="text-gray-600 mt-1">
            Period: {new Date(startDate).toLocaleDateString()} — {new Date(endDate).toLocaleDateString()}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Invoiced</p>
            <p className="text-2xl font-bold text-gray-900">MVR {reportData.totalInvoiced.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Received</p>
            <p className="text-2xl font-bold text-emerald-800">MVR {reportData.totalReceived.toLocaleString()}</p>
          </div>
           <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Pending / Overdue</p>
            <p className="text-2xl font-bold text-amber-800">MVR {reportData.totalPending.toLocaleString()}</p>
          </div>
           <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Tax Collected (8%)</p>
            <p className="text-2xl font-bold text-blue-800">MVR {reportData.totalTax.toLocaleString()}</p>
          </div>
        </div>

        {/* Detailed Table */}
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-maldives-600" /> Transaction Details
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Invoice #</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Client</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Total (MVR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No transactions found in this date range.
                  </td>
                </tr>
              ) : (
                reportData.filtered.map(inv => (
                  <tr key={inv.id}>
                    <td className="py-3 px-4 text-gray-800">{inv.date}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-gray-800 font-medium">{inv.clientName}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${
                        inv.status === InvoiceStatus.PAID ? 'bg-green-50 text-green-700 border-green-200' :
                        inv.status === InvoiceStatus.PENDING ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-800">
                      {inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {reportData.filtered.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                  <td colSpan={3} className="py-3 px-4 text-right">Total</td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    MVR {reportData.totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Footer for Print */}
        <div className="hidden print-show mt-12 pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>Report generated on {new Date().toLocaleString()} by SANDPIX MALDIVES System</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;