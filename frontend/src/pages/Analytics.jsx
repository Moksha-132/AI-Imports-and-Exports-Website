import React, { useState, useEffect } from 'react';
import { BarChart, PieChart, TrendingUp, TrendingDown, DollarSign, Package, FileCheck, Globe, ArrowRight, Download, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
const Analytics = () => {
  const [tradeStats, setTradeStats] = useState({
    total_trade_volume: "$0",
    duty_saved: "$0",
    docs_processed: "0",
    top_hsn_categories: [],
    monthly_breakdown: []
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await fetch('http://localhost:8000/analytics');
        const data = await response.json();
        setTradeStats(data);
      } catch (error) {
        console.error("Failed to synchronize analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);
  const topMetrics = [
    { label: "Total Trade Volume", val: tradeStats.total_trade_volume, trend: "+12.4%", positive: true, icon: Globe },
    { label: "Duty Saved (HSN)", val: tradeStats.duty_saved, trend: "+8.2%", positive: true, icon: DollarSign },
    { label: "Docs Processed", val: tradeStats.docs_processed, trend: "+2", positive: true, icon: FileCheck },
    { label: "Avg Duty Rate", val: "14.2%", trend: "-1.5%", positive: true, icon: TrendingDown },
  ];
  const getMonthName = (index) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[index];
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {topMetrics.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} 
            className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-amber-500/30 transition-all">
            <div className="flex justify-between items-start mb-10">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <m.icon className="text-amber-600" size={24} />
              </div>
              <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-black ${m.positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                {m.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {m.trend}
              </div>
            </div>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{m.val}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{m.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-slate-100">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h4 className="text-3xl font-black text-slate-900 tracking-tight">Monthly Trade Volume</h4>
              <p className="mt-1 text-slate-500 font-medium">Corridor activity volume</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><div className="w-3 h-3 rounded-full bg-amber-500" /> IMPORT</div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-200"><div className="w-3 h-3 rounded-full bg-slate-200" /> EXPORT</div>
            </div>
          </div>
          <div className="h-80 pt-10 flex items-end gap-5 border-b border-slate-50">
            {(tradeStats.monthly_breakdown || [40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95]).map((v, i) => {
              const max = Math.max(...(tradeStats.monthly_breakdown || [100]));
              const h = tradeStats.monthly_breakdown ? (v / (max || 1) * 100) : v;
              return (
                <div key={i} className="flex-1 flex flex-col gap-2 items-center group relative">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl z-20 whitespace-nowrap">
                    ${tradeStats.monthly_breakdown ? v.toLocaleString() : (v/10).toFixed(1) + 'M'}
                  </div>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(8, h)}%` }} transition={{ delay: i * 0.05, duration: 1 }} 
                    className={`w-full rounded-t-2xl transition-all ${i === new Date().getMonth() ? "bg-amber-500 shadow-xl shadow-amber-500/20" : "bg-slate-100 group-hover:bg-slate-200"}`} />
                  <span className="mt-4 text-[10px] font-black uppercase tracking-tighter text-slate-400">{getMonthName(i)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="lg:col-span-4 bg-white p-10 rounded-[2.5rem] border border-slate-100">
          <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Trade Corridors</h4>
          <p className="mb-12 text-sm text-slate-500 font-medium">Top performing regions</p>
          <div className="space-y-12">
            {[
              { r: "North America", v: "42%", c: "bg-amber-500" },
              { r: "European Union", v: "28%", c: "bg-emerald-500" },
              { r: "East Asia", v: "18%", c: "bg-blue-500" },
              { r: "Middle East", v: "12%", c: "bg-slate-300" },
            ].map((cor, i) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                  <span className="text-slate-500">{cor.r}</span>
                  <span className="text-slate-900">{cor.v}</span>
                </div>
                <div className="w-full h-3 p-[2px] bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: cor.v }} transition={{ duration: 1.5, delay: i * 0.2 }} className={`h-full rounded-full ${cor.c} shadow-sm`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Categories Table */}
      <div className="glass-card bg-white overflow-hidden shadow-sm">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">Top Trade Categories</h4>
            <p className="text-slate-500 font-medium mt-1">High-volume HSN classifications</p>
          </div>
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 transition-colors">
            View All Report <ArrowRight size={14} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">HSN Code</th>
                <th className="px-10 py-6">Category Description</th>
                <th className="px-10 py-6">Volume</th>
                <th className="px-10 py-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(tradeStats.top_hsn_categories.length > 0 ? tradeStats.top_hsn_categories : [
                { code: "8504.40.00", category: "Solar Inverters & Converters", vol: "$450,000", duty: "Active" },
                { code: "8517.13.00", category: "Smartphones & Wireless Tech", vol: "$280,000", duty: "Active" },
              ]).map((category, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-all group">
                  <td className="px-10 py-8 font-black text-slate-900 group-hover:text-amber-600 transition-colors">{category.code}</td>
                  <td className="px-10 py-8">
                    <div className="text-sm font-black text-slate-800">{category.category}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Validated Intelligence</div>
                  </td>
                  <td className="px-10 py-8 font-black text-slate-900">{category.vol}</td>
                  <td className="px-10 py-8"><span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-100">Verified</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
