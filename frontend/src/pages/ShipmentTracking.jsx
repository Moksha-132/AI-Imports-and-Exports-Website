import React, { useState, useEffect } from 'react';
import { Ship, Truck, Plane, MapPin, Search, Filter, Clock, MoreVertical, CheckCircle, AlertCircle, ChevronRight, Anchor } from 'lucide-react';
import { motion } from 'framer-motion';

const ShipmentTracking = () => {
  const [filter, setFilter] = useState('All');
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/shipments')
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setShipments(data);
        } else {
          console.error("Expected array but got:", data);
          setShipments([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Tracking fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredShipments = Array.isArray(shipments) ? shipments.filter(s => 
    filter === 'All' || s.type === filter || (filter === 'Delayed' && s.status === 'Delayed')
  ) : [];

  return (
    <div className="space-y-8 pb-12">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <span>Backend Error: {error}. Please ensure the backend server is running and restarted.</span>
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="glass-card p-10 flex flex-col md:flex-row justify-between items-center gap-8 bg-white">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Track Container/AWB..." 
              className="bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm w-full md:w-96 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-sm font-medium"
            />
          </div>
          <button className="bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-slate-300">
            Track
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {['All', 'Sea', 'Air', 'Land', 'Delayed'].map((item) => (
            <button 
              key={item}
              onClick={() => setFilter(item)}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                filter === item ? "bg-amber-50 text-amber-600 border-amber-100 shadow-sm" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Active Shipments List */}
        <div className="lg:col-span-7 space-y-8">
          <h3 className="text-2xl font-black text-slate-900 mb-2">Live Shipments</h3>
          {filteredShipments.length > 0 ? filteredShipments.map((shipment, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card group hover:border-amber-500/30 transition-all cursor-pointer bg-white"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-5">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-50 transition-all border border-slate-100">
                      {shipment.type === "Sea" ? <Ship size={28} /> : shipment.type === "Air" ? <Plane size={28} /> : <Truck size={28} />}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900">{shipment.shipment_id}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Global Freight • {shipment.type}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                      shipment.status === "Delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      shipment.status === "Delayed" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>
                      {shipment.status}
                    </span>
                    <p className="text-xs text-slate-500 font-bold">ETA: {shipment.eta ? new Date(shipment.eta).toLocaleDateString() : 'TBD'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-10 mb-10">
                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-[10px] text-slate-400 font-black tracking-widest mb-2 uppercase">Origin</p>
                    <p className="text-lg font-black text-slate-900">{shipment.origin.split(',')[0]}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{shipment.origin.split(',')[1] || ''}</p>
                  </div>
                  <div className="flex-[2] relative py-4">
                    <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-100 rounded-full -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-0 h-1.5 bg-amber-500 rounded-full -translate-y-1/2 transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.3)]" style={{ width: `${shipment.progress}%` }}></div>
                    <motion.div 
                      className="absolute top-1/2 -translate-y-1/2 text-amber-600 bg-white p-1 rounded-full border-2 border-amber-500 shadow-sm"
                      style={{ left: `${shipment.progress}%` }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {shipment.type === "Sea" ? <Anchor size={12} /> : <ChevronRight size={14} />}
                    </motion.div>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-[10px] text-slate-400 font-black tracking-widest mb-2 uppercase">Destination</p>
                    <p className="text-lg font-black text-slate-900">{shipment.destination.split(',')[0]}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{shipment.destination.split(',')[1] || ''}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="glass-card p-12 text-center text-slate-400 font-bold bg-white">
              {loading ? "Loading shipments..." : error ? "Unable to load data." : "No live shipments found."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShipmentTracking;
