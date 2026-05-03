import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, AlertCircle, Globe, ArrowUpRight, ArrowDownRight, Truck, Database } from 'lucide-react';
import { apiFetch } from '../api';

const StatCard = ({ title, value, change, isPositive, icon: Icon, gradient }) => (
  <div className="glass-card p-8 flex flex-col gap-6 relative overflow-hidden group bg-white">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity`}></div>
    <div className="flex items-center justify-between">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
        <Icon className="text-amber-500" size={28} />
      </div>
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </div>
    </div>
    <div>
      <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-4xl font-black text-slate-900 mt-2">{value || '0'}</h3>
    </div>
  </div>
);

const DashboardHome = () => {
  const [shipments, setShipments] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parallel fetching for dashboard overview
    Promise.all([
      apiFetch('/shipments'),
      apiFetch('/risk')
    ])
    .then(([shipmentData, riskData]) => {
      setShipments(shipmentData);
      setRiskData(riskData);
      setLoading(false);
    })
    .catch(err => {
      console.error("Dashboard data fetch error:", err);
      setLoading(false);
    });
  }, []);

  const riskCounts = {
    Low: riskData.filter(r => r.risk_level === 'Low').length,
    Medium: riskData.filter(r => r.risk_level === 'Medium').length,
    High: riskData.filter(r => r.risk_level === 'High' || r.risk_level === 'Critical').length
  };

  const totalRisk = riskData.length || 1;

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Total Shipments" 
          value={shipments.length} 
          change="Real-time" 
          isPositive={true} 
          icon={Package}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard 
          title="Active Risk Alerts" 
          value={riskData.filter(r => r.risk_level !== 'Low').length} 
          change="Updated" 
          isPositive={false} 
          icon={AlertCircle}
          gradient="from-rose-500 to-orange-500"
        />
        <StatCard 
          title="Trust Index" 
          value={riskData.length > 0 ? (riskData.reduce((acc, curr) => acc + curr.trust_score, 0) / riskData.length).toFixed(1) : '0'} 
          change="Avg" 
          isPositive={true} 
          icon={TrendingUp}
          gradient="from-amber-500 to-orange-500"
        />
        <StatCard 
          title="Global Nodes" 
          value={new Set(shipments.map(s => s.destination)).size} 
          change="Cities" 
          isPositive={true} 
          icon={Globe}
          gradient="from-emerald-500 to-teal-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card p-10 bg-white">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-slate-900">Live Shipment Tracking</h3>
            <button className="text-amber-600 text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {shipments.length > 0 ? (
              shipments.slice(0, 5).map((shipment, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-500/30 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                      <Truck size={22} className="text-amber-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{shipment.shipment_id}</p>
                      <p className="text-sm text-slate-500 font-medium">{shipment.origin} → {shipment.destination}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 uppercase">{shipment.status}</p>
                    <p className="text-xs text-amber-600 font-bold mt-1">
                      {shipment.eta ? new Date(shipment.eta).toLocaleDateString() : 'Pending ETA'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                  <Database size={32} className="text-slate-300" />
                </div>
                <h4 className="text-xl font-black text-slate-900">No shipments found</h4>
                <p className="text-slate-500 font-medium mt-2">Start by adding your first shipment in the Tracking tab.</p>
              </div>
            )}
          </div>
        </div>

        {/* Risk Breakdown */}
        <div className="glass-card p-10 bg-white">
          <h3 className="text-2xl font-black text-slate-900 mb-10">Risk Distribution</h3>
          <div className={`flex flex-col gap-8 ${riskData.length === 0 ? 'opacity-40' : ''}`}>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500 uppercase tracking-widest text-[10px]">Low Risk</span>
                <span className="text-emerald-600">{((riskCounts.Low / totalRisk) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-[2px]">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(riskCounts.Low / totalRisk) * 100}%` }}></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500 uppercase tracking-widest text-[10px]">Medium Risk</span>
                <span className="text-amber-600">{((riskCounts.Medium / totalRisk) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-[2px]">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(riskCounts.Medium / totalRisk) * 100}%` }}></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500 uppercase tracking-widest text-[10px]">High Risk</span>
                <span className="text-rose-600">{((riskCounts.High / totalRisk) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-[2px]">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(riskCounts.High / totalRisk) * 100}%` }}></div>
              </div>
            </div>
          </div>
          {riskData.length === 0 && (
            <p className="text-xs text-slate-400 font-bold italic text-center mt-12">No risk profiles indexed yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
