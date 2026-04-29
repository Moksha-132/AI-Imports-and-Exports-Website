import React, { useState, useEffect } from 'react';
import { BarChart, PieChart, TrendingUp, TrendingDown, DollarSign, Package, FileCheck, Globe, ArrowRight, Download, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Analytics = () => {
  const [data, setData] = useState({
    total_trade_volume: "$0",
    duty_saved: "$0",
    docs_processed: "0",
    top_hsn_categories: []
  });

  useEffect(() => {
    fetch('http://localhost:8000/analytics')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Analytics fetch error:", err));
  }, []);

  const stats = [
    { label: "Total Trade Volume", val: data.total_trade_volume, trend: "+12.4%", positive: true, icon: Globe },
    { label: "Duty Saved (HSN)", val: data.duty_saved, trend: "+8.2%", positive: true, icon: DollarSign },
    { label: "Docs Processed", val: data.docs_processed, trend: "+2", positive: true, icon: FileCheck },
    { label: "Avg Duty Rate", val: "14.2%", trend: "-1.5%", positive: true, icon: TrendingDown },
  ];

  const topHSN = data.top_hsn_categories.length > 0 ? data.top_hsn_categories : [
    { code: "8504.40.00", category: "Solar Inverters & Converters", vol: "$450,000", duty: "0%", count: 12 },
    { code: "8517.13.00", category: "Smartphones & Wireless Tech", vol: "$280,000", duty: "2%", count: 45 },
    { code: "6109.10.00", category: "Cotton T-Shirts & Apparel", vol: "$120,000", duty: "15%", count: 89 },
    { code: "8471.30.00", category: "Laptops & Data Processing", vol: "$95,000", duty: "0%", count: 8 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-900">Global Trade Analytics</h3>
          <p className="text-base text-slate-500 font-medium">Performance metrics and trade corridor report</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-slate-600 font-bold text-sm hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
            <Calendar size={18} />
            Last 30 Days
          </button>
          <button className="flex items-center gap-3 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-lg shadow-slate-200">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 bg-white"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                <stat.icon size={22} className="text-amber-500" />
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${stat.positive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                {stat.trend}
              </span>
            </div>
            <h4 className="text-4xl font-black text-slate-900 mb-2">{stat.val}</h4>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Trade Volume Chart Mockup */}
        <div className="lg:col-span-2 glass-card p-10 bg-white">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h4 className="text-2xl font-black text-slate-900">Monthly Trade Volume</h4>
              <p className="text-sm text-slate-500 font-medium">Volume across all trade corridors</p>
            </div>
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Import</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Export</span>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-5 h-80 pt-10">
            {(data.monthly_breakdown || [40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95]).map((val, i) => {
              const maxVal = Math.max(...(data.monthly_breakdown || [100]));
              const h = data.monthly_breakdown ? (val / (maxVal || 1) * 100) : val;
              return (
                <div key={i} className="flex-1 flex flex-col gap-2 items-center group relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-xl font-black opacity-0 group-hover:opacity-100 transition-all shadow-xl z-10 whitespace-nowrap">
                    ${data.monthly_breakdown ? val.toLocaleString() : (val/10).toFixed(1) + 'M'}
                  </div>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(5, h)}%` }}
                    transition={{ delay: i * 0.05, duration: 1 }}
                    className={`w-full rounded-t-xl transition-all ${i === new Date().getMonth() ? "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "bg-slate-100 group-hover:bg-slate-200"}`}
                  />
                  <span className="text-[10px] text-slate-400 font-black mt-3">M{i+1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Geographic Distribution Mockup */}
        <div className="glass-card p-10 bg-white">
          <h4 className="text-2xl font-black text-slate-900 mb-2">Trade Corridors</h4>
          <p className="text-sm text-slate-500 font-medium mb-10">Top performing regions by volume</p>
          
          <div className="flex flex-col gap-10">
            {[
              { region: "North America", vol: "42%", color: "bg-amber-500" },
              { region: "European Union", vol: "28%", color: "bg-emerald-500" },
              { region: "East Asia", vol: "18%", color: "bg-blue-500" },
              { region: "Middle East", vol: "12%", color: "bg-slate-300" },
            ].map((reg, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between text-sm font-black uppercase tracking-widest">
                  <span className="text-slate-500">{reg.region}</span>
                  <span className="text-slate-900">{reg.vol}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-[2px]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: reg.vol }}
                    className={`h-full rounded-full ${reg.color}`}
                  />
                </div>
              </div>
            ))}
          </div>


        </div>
      </div>

      <div className="glass-card overflow-hidden bg-white">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center">
          <h4 className="text-2xl font-black text-slate-900">Top HSN Categories</h4>
          <button className="text-amber-600 text-xs font-black uppercase tracking-[0.2em] hover:text-amber-700 hover:translate-x-1 transition-all flex items-center gap-2">
            Detailed View <ArrowRight size={18} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">HSN Code</th>
                <th className="px-10 py-6">Category</th>
                <th className="px-10 py-6">Trade Volume</th>
                <th className="px-10 py-6">Avg Duty</th>
                <th className="px-10 py-6 text-right">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topHSN.map((hsn, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                  <td className="px-10 py-6 text-slate-900 font-black text-lg group-hover:text-amber-600 transition-colors">{hsn.code}</td>
                  <td className="px-10 py-6 text-slate-500 font-bold text-sm">{hsn.category}</td>
                  <td className="px-10 py-6 text-slate-900 font-black text-lg">{hsn.vol}</td>
                  <td className="px-10 py-6">
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border ${hsn.duty === "0%" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                      {hsn.duty}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right text-slate-400 font-black text-sm tracking-widest">{hsn.count.toLocaleString()}</td>
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
