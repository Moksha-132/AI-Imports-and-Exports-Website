import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Calendar, CheckCircle, AlertCircle, Clock, Filter, Download, ArrowRight, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Ledger = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetch('http://localhost:8000/documents')
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ledger fetch error:", err);
        setLoading(false);
      });
  }, []);

  const updatePayment = (id, status) => {
    fetch(`http://localhost:8000/documents/${id}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    .then(() => {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, payment_status: status } : t));
    });
  };

  const filtered = transactions.filter(t => 
    filter === 'All' || t.payment_status.toLowerCase() === filter.toLowerCase()
  );

  const totalValue = transactions.reduce((acc, curr) => acc + parseFloat(curr.extracted_data?.amount || 0), 0);
  const unpaidCount = transactions.filter(t => t.payment_status !== 'paid').length;

  return (
    <div className="space-y-10 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total Accounts Payable</p>
          <h3 className="text-4xl font-black text-slate-900">${totalValue.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Pending Payments</p>
          <h3 className="text-4xl font-black text-amber-500">{unpaidCount}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Estimated Duty</p>
          <h3 className="text-4xl font-black text-emerald-500">${(totalValue * 0.12).toLocaleString()}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Active Clients</p>
          <h3 className="text-4xl font-black text-slate-900">{new Set(transactions.map(t => t.client_name)).size}</h3>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-900">Financial Ledger</h2>
        <div className="flex gap-3">
          {['All', 'Paid', 'Unpaid', 'Overdue'].map(m => (
            <button 
              key={m}
              onClick={() => setFilter(m)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filter === m ? 'bg-black text-white border-black' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Date</th>
                <th className="px-10 py-6">Transaction / Invoice</th>
                <th className="px-10 py-6">Client</th>
                <th className="px-10 py-6">Amount</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="px-10 py-20 text-center text-slate-400 font-bold">Synchronizing ledger data...</td></tr>
              ) : filtered.map((t, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-all group">
                  <td className="px-10 py-6 text-slate-400 text-sm font-bold">
                    <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(t.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="font-black text-slate-900">{t.extracted_data?.invoice_no || t.filename}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{t.extracted_data?.vendor || 'Unknown Vendor'}</div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 text-slate-900 font-black">
                      <User size={14} className="text-slate-400" /> {t.client_name || 'Primary Client'}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-slate-900 font-black">
                    ${parseFloat(t.extracted_data?.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-10 py-6">
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border ${
                      t.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      t.payment_status === 'overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {t.payment_status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <select 
                      value={t.payment_status} 
                      onChange={(e) => updatePayment(t.id, e.target.value)}
                      className="bg-transparent text-[10px] font-black text-slate-400 uppercase tracking-widest outline-none cursor-pointer hover:text-black transition-colors"
                    >
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
