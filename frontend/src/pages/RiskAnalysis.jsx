import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Search, Filter, ArrowUpRight, Globe, TrendingUp, History, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '../api';
const RiskAnalysis = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskProfiles, setRiskProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        const data = await apiFetch('/risk');
        setRiskProfiles(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRiskData();
  }, []);
  const filteredProfiles = riskProfiles.filter(p => p.entity_name.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <div className="space-y-10 pb-12">
      {error && (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-600 font-bold flex items-center gap-4 animate-in fade-in">
          <AlertTriangle size={24} />
          <span>Sync Error: {error}</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Trust Score</p>
          <div className="flex items-end gap-3">
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">88.2</h3>
            <span className="mb-1 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-black rounded-full">+4.2%</span>
          </div>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Entities Screened</p>
          <div className="flex items-end gap-3">
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{riskProfiles.length}</h3>
            <span className="mb-1 px-3 py-1 bg-amber-50 text-amber-600 text-xs font-black rounded-full">Active</span>
          </div>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Critical Alerts</p>
          <div className="flex items-end gap-3">
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{riskProfiles.filter(p => p.risk_level === 'High').length}</h3>
            <span className="mb-1 px-3 py-1 bg-rose-50 text-rose-600 text-xs font-black rounded-full">High Priority</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Entity Risk Profiles</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Filter entities..." 
              className="w-80 pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-amber-500 transition-all shadow-sm" />
          </div>
          <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-amber-500 transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {loading ? (
          <div className="col-span-2 py-32 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing risk database...</div>
        ) : filteredProfiles.length > 0 ? filteredProfiles.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.trust_score > 80 ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                  {p.trust_score > 80 ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors">{p.entity_name}</h3>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Globe size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Global Trade Entity</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Trust Index</p>
                <p className={`text-3xl font-black tracking-tighter ${p.trust_score > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{p.trust_score}</p>
              </div>
            </div>
            {p.risk_level === 'Low' ? (
              <div className="px-4 py-3 mb-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Entity cleared — no active risk flags</span>
              </div>
            ) : (
              <div className={`p-4 mb-4 rounded-xl border ${p.risk_level === 'High' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'}`}>
                <p className={`mb-2 text-[10px] font-black uppercase tracking-widest ${p.risk_level === 'High' ? 'text-rose-400' : 'text-amber-400'}`}>Risk Reason</p>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`mt-0.5 shrink-0 ${p.risk_level === 'High' ? 'text-rose-500' : 'text-amber-500'}`} size={14} />
                  <p className={`text-sm font-bold leading-snug ${p.risk_level === 'High' ? 'text-rose-700' : 'text-amber-700'}`}>{p.message}</p>
                </div>
              </div>
            )}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${p.risk_level === 'Low' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${p.risk_level === 'Low' ? 'text-emerald-500' : 'text-amber-500'}`}>
                {p.risk_level} Priority Oversight
              </span>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-2 py-40 bg-slate-50/30 border-4 border-dashed border-slate-100 rounded-[4rem] text-center flex flex-col items-center justify-center space-y-6">
            <div className="p-6 bg-white rounded-3xl shadow-sm text-slate-200"><Shield size={64} /></div>
            <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">No Intelligence Data Found</h3>
          </div>
        )}
      </div>
    </div>
  );
};
export default RiskAnalysis;
