import React, { useMemo } from 'react';
import { Invoice, InvoiceStatus, ViewConfig } from '../types';
import { Plus, TrendingUp, DollarSign, FileText, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  invoices: Invoice[];
  setView: (config: ViewConfig) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, setView }) => {
  
  const stats = useMemo(() => {
    const totalRevenue = invoices
      .filter(i => i.status === InvoiceStatus.PAID)
      .reduce((acc, curr) => acc + curr.total, 0);
    
    const pendingAmount = invoices
      .filter(i => i.status === InvoiceStatus.PENDING)
      .reduce((acc, curr) => acc + curr.total, 0);

    return { totalRevenue, pendingAmount, count: invoices.length };
  }, [invoices]);

  const chartData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        name: d.toLocaleString('default', { month: 'short' }),
        fullDate: d,
        amount: 0
      };
    }).reverse();

    invoices.forEach(inv => {
      if (inv.status === InvoiceStatus.PAID) {
        const invDate = new Date(inv.date);
        const monthData = last6Months.find(d => 
          d.fullDate.getMonth() === invDate.getMonth() && 
          d.fullDate.getFullYear() === invDate.getFullYear()
        );
        if (monthData) {
          monthData.amount += inv.total;
        }
      }
    });
    return last6Months;
  }, [invoices]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back to SandPix Maldives</p>
        </div>
        <button 
          onClick={() => setView({ view: 'create' })}
          className="bg-maldives-600 hover:bg-maldives-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
        >
          <Plus size={20} /> New Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-800">MVR {stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Payments</p>
            <p className="text-2xl font-bold text-gray-800">MVR {stats.pendingAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-800">{stats.count}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `MVR ${(val/1000).toFixed(0)}k`} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  formatter={(value: number) => [`MVR ${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#199ead' : '#23c4d3'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Invoices</h3>
          <div className="space-y-4">
            {invoices.slice(0, 5).map(inv => (
              <div 
                key={inv.id} 
                onClick={() => setView({ view: 'view', invoiceId: inv.id })}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="font-semibold text-gray-800">{inv.clientName}</p>
                  <p className="text-xs text-gray-500">{inv.invoiceNumber} • {inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">MVR {inv.total.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    inv.status === InvoiceStatus.PAID ? 'bg-green-100 text-green-700' :
                    inv.status === InvoiceStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No invoices yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;