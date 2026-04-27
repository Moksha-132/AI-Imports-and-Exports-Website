import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Search, Filter, ArrowUpRight, ArrowDownRight, Globe, TrendingUp, History } from 'lucide-react';
import { motion } from 'framer-motion';

const RiskAnalysis = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskProfiles, setRiskProfiles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/risk')
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setRiskProfiles(data);
          setAlerts(data.filter(d => d.trust_score < 50).map(d => ({
            type: d.risk_level,
            msg: d.message,
            time: new Date(d.created_at).toLocaleDateString()
          })));
        } else {
          console.error("Expected array but got:", data);
          setRiskProfiles([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Risk fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredProfiles = Array.isArray(riskProfiles) ? riskProfiles.filter(p => 
    p.entity_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="space-y-8 pb-12">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle size={20} />
          <span>Backend Error: {error}. Please ensure the backend server is running and restarted.</span>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 border-l-8 border-emerald-500 bg-white">
          <div className="flex justify-between items-start mb-6">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Overall Trust Score</p>
            <Shield className="text-emerald-500" size={20} />
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-5xl font-black text-slate-900">82.4</h3>
            <div className="flex items-center text-emerald-600 text-sm font-black mb-1 px-2 py-0.5 bg-emerald-50 rounded-full">
              <ArrowUpRight size={14} /> +2.1%
            </div>
          </div>
          <div className="mt-6 w-full h-3 bg-slate-100 rounded-full overflow-hidden p-[2px]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "82.4%" }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>

        <div className="glass-card p-8 border-l-8 border-amber-500 bg-white">
          <div className="flex justify-between items-start mb-6">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Active Alerts</p>
            <AlertTriangle className="text-amber-500" size={20} />
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-5xl font-black text-slate-900">{alerts.length}</h3>
            <p className="text-slate-500 text-xs font-bold mb-1">Global Monitoring</p>
          </div>
          <p className="mt-6 text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-full inline-block">{alerts.filter(a => a.type === 'Critical').length} critical issues</p>
        </div>

        <div className="glass-card p-8 border-l-8 border-amber-400 bg-white">
          <div className="flex justify-between items-start mb-6">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Screening Vol</p>
            <History className="text-amber-500" size={20} />
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-5xl font-black text-slate-900">{riskProfiles.length}</h3>
            <div className="flex items-center text-amber-600 text-sm font-black mb-1 px-2 py-0.5 bg-amber-50 rounded-full">
              <TrendingUp size={14} /> Active
            </div>
          </div>
          <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total entities screened</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Screening Table */}
        <div className="lg:col-span-2 glass-card overflow-hidden bg-white">
          <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <h3 className="text-3xl font-black text-slate-900">Entity Risk Profiles</h3>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search entities..." 
                  className="bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm w-full md:w-72 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-amber-500 hover:border-amber-500/30 transition-all shadow-sm">
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-10 py-6">Entity Name</th>
                  <th className="px-10 py-6">Risk Level</th>
                  <th className="px-10 py-6">Trust Score</th>
                  <th className="px-10 py-6 text-right">Last Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProfiles.length > 0 ? filteredProfiles.map((profile, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-10 py-6">
                      <p className="text-slate-900 font-black text-lg group-hover:text-amber-600 transition-colors">{profile.entity_name}</p>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        profile.risk_level === "Low" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        profile.risk_level === "Medium" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100"
                      }`}>
                        {profile.risk_level === "Low" && <CheckCircle size={12} />}
                        {profile.risk_level} Risk
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-900 font-black text-lg">{profile.trust_score}</span>
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden p-[1px]">
                          <div 
                            className={`h-full rounded-full ${
                              profile.trust_score > 80 ? "bg-emerald-500" : profile.trust_score > 60 ? "bg-amber-500" : "bg-rose-500"
                            }`} 
                            style={{ width: `${profile.trust_score}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-slate-400 text-sm font-bold text-right">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-10 py-12 text-center text-slate-400 font-bold">
                      {loading ? "Loading profiles..." : error ? "Unable to load data." : "No entity records found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: Alerts & Intelligence */}
        <div className="space-y-10">
          <div className="glass-card p-8 bg-white">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <AlertTriangle className="text-amber-500" size={22} />
              Recent Risk Alerts
            </h3>
            <div className="space-y-6">
              {alerts.length > 0 ? alerts.map((alert, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-amber-500/20 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                      alert.type === "Critical" ? "bg-rose-50 text-rose-600 border-rose-100" :
                      alert.type === "High" ? "bg-rose-50 text-rose-600 border-rose-100" :
                      alert.type === "Medium" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {alert.type}
                    </span>
                    <span className="text-[9px] text-slate-400 font-black">{alert.time}</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-bold group-hover:text-slate-900 transition-colors">{alert.msg}</p>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400 text-xs font-bold italic">No active alerts detected</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
