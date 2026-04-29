import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Search, Filter, ArrowUpRight, Globe, TrendingUp, History, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const RiskAnalysis = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskProfiles, setRiskProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/risk')
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(data => {
        setRiskProfiles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredProfiles = riskProfiles.filter(p => 
    p.entity_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-12">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold flex items-center gap-3">
          <AlertTriangle size={20} />
          <span>Sync Error: {error}. Resetting connection...</span>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Avg Trust Score</p>
          <div className="flex items-end gap-3">
            <h3 className="text-5xl font-black text-slate-900">88.2</h3>
            <span className="text-emerald-500 font-black text-sm mb-1 px-2 py-0.5 bg-emerald-50 rounded-full">+4.2%</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Entities Screened</p>
          <div className="flex items-end gap-3">
            <h3 className="text-5xl font-black text-slate-900">{riskProfiles.length}</h3>
            <span className="text-amber-500 font-black text-sm mb-1 px-2 py-0.5 bg-amber-50 rounded-full">Active</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Critical Alerts</p>
          <div className="flex items-end gap-3">
            <h3 className="text-5xl font-black text-slate-900">{riskProfiles.filter(p => p.risk_level === 'High').length}</h3>
            <span className="text-rose-500 font-black text-sm mb-1 px-2 py-0.5 bg-rose-50 rounded-full">High Priority</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-900">Entity Risk Profiles</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search entity..." 
              className="bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm w-72 focus:border-amber-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-amber-500 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Card Grid - Matching User Screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {loading ? (
          <div className="col-span-2 text-center py-20 text-slate-400 font-bold">Scanning database for risk profiles...</div>
        ) : filteredProfiles.length > 0 ? filteredProfiles.map((profile, i) => (
          <motion.div 
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
          >
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${profile.trust_score > 80 ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                  {profile.trust_score > 80 ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />}
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">{profile.entity_name}</h3>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Globe size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">Global Exporter</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Trust Score</p>
                <p className={`text-4xl font-black ${profile.trust_score > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{profile.trust_score}</p>
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-3xl p-6 mb-10 border border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Primary Risk Factor</p>
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-amber-500" size={16} />
                <p className="text-sm font-bold text-slate-600">{profile.message}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${profile.risk_level === 'Low' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                <span className={`text-xs font-black uppercase tracking-widest ${profile.risk_level === 'Low' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {profile.risk_level} Priority
                </span>
              </div>
              <button className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:text-rose-600 transition-colors">
                Report <ExternalLink size={14} />
              </button>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-2 text-center py-20 text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-[3rem]">
            No risk entities found. Upload a document to trigger an automatic scan.
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAnalysis;
