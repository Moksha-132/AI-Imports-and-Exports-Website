import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Calendar, CheckCircle, AlertCircle, Clock, Filter, Download, ArrowRight, User } from 'lucide-react';
import { apiFetch } from '../api';

const Ledger = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    apiFetch('/documents')
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
  }, []);

  const updatePayment = (id, status) => {
    apiFetch(`/documents/${id}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    .then(() => {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, payment_status: status } : t));
    });
  };
  const filtered = transactions.filter(t => filter === 'All' || t.payment_status.toLowerCase() === filter.toLowerCase());
  const totalValue = transactions.reduce((acc, curr) => acc + parseFloat(curr.extracted_data?.amount || 0), 0);
  const unpaidCount = transactions.filter(t => t.payment_status !== 'paid').length;
  return (
    <div className="space-y-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Payable</p>
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">${totalValue.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Pending</p>
          <h3 className="text-4xl font-black text-amber-500 tracking-tight">{unpaidCount}</h3>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Est. Duty</p>
          <h3 className="text-4xl font-black text-emerald-500 tracking-tight">${(totalValue * 0.12).toLocaleString()}</h3>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Clients</p>
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">{new Set(transactions.map(t => t.client_name)).size}</h3>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Financial Ledger</h2>
        <div className="flex gap-4">
          {['All', 'Paid', 'Unpaid', 'Overdue'].map(m => (
            <button key={m} onClick={() => setFilter(m)}
              className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filter === m ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
              }`}>{m}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-12 py-8">Date</th>
                <th className="px-12 py-8">Transaction / Source</th>
                <th className="px-12 py-8">Entity Name</th>
                <th className="px-12 py-8">Valuation</th>
                <th className="px-12 py-8">Compliance</th>
                <th className="px-12 py-8">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="px-12 py-32 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing...</td></tr>
              ) : filtered.map((t, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-12 py-8 text-slate-400 text-sm font-bold">
                    <div className="flex items-center gap-3"><Calendar size={16} /> {new Date(t.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-12 py-8">
                    <div className="text-lg font-black text-slate-900 tracking-tight">{t.extracted_data?.invoice_no || t.filename}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice Reference</div>
                  </td>
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-3 text-slate-900 font-black text-lg tracking-tight">
                      <User size={18} className="text-slate-400" /> {t.extracted_data?.vendor || t.client_name || 'Company Name'}
                    </div>
                  </td>
                  <td className="px-12 py-8 text-slate-900 font-black text-xl tracking-tight">
                    ${parseFloat(t.extracted_data?.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-12 py-8">
                    <span className={`px-5 py-2 text-[10px] font-black rounded-full border uppercase tracking-widest ${
                      t.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      t.payment_status === 'overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>{t.payment_status}</span>
                  </td>
                  <td className="px-12 py-8">
                    <select value={t.payment_status} onChange={(e) => updatePayment(t.id, e.target.value)}
                      className="bg-transparent text-[10px] font-black text-slate-400 uppercase tracking-widest outline-none cursor-pointer hover:text-slate-900 transition-colors">
                      <option value="unpaid">Mark Unpaid</option>
                      <option value="paid">Mark Paid</option>
                      <option value="overdue">Mark Overdue</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Ledger;
