import React, { useState, useEffect } from 'react';
import { Ship, Truck, Plane, MapPin, Search, Filter, Clock, MoreVertical, CheckCircle, AlertCircle, ChevronRight, Anchor } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '../api';

const ShipmentTracking = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [allShipments, setAllShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const synchronizeShipments = async () => {
      try {
        const data = await apiFetch('/shipments');
        setAllShipments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Logistics synchronization failed:", err);
        setFetchError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    synchronizeShipments();
  }, []);
  const filteredShipments = allShipments.filter(shipment => {
    const matchesFilter = activeFilter === 'All' || 
                         shipment.type === activeFilter || 
                         (activeFilter === 'Delayed' && shipment.status === 'Delayed');
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch = shipment.shipment_id.toLowerCase().includes(normalizedSearch) || 
                         shipment.origin.toLowerCase().includes(normalizedSearch) || 
                         shipment.destination.toLowerCase().includes(normalizedSearch);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-10 pb-12">
      {fetchError && (
        <div className="p-6 flex items-center gap-4 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-600 font-bold animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={24} />
          <span>Technical Alert: {fetchError}. Please ensure the logistics engine is online.</span>
        </div>
      )}
      <div className="bg-white p-10 flex flex-col md:flex-row justify-between items-center gap-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Track Container / AWB..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-[450px] pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-sm" />
          </div>
          <button className="px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-black hover:shadow-slate-300 transition-all active:scale-95">
            Track
          </button>
        </div>
        <div className="flex items-center gap-4 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto scrollbar-hide">
          {['All', 'Sea', 'Air', 'Land', 'Delayed'].map((t) => (
            <button key={t} onClick={() => setActiveFilter(t)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                activeFilter === t ? "bg-amber-50 text-amber-600 border-amber-100 shadow-sm" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:text-slate-900"
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>
            <div className="space-y-10">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Active Shipments</h3>
          {filteredShipments.length > 0 ? filteredShipments.map((s, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm border-l-8 border-l-slate-100 hover:border-l-amber-500 hover:border-amber-500/40 transition-all group cursor-pointer overflow-hidden">
              <div className="p-10">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex gap-6">
                    <div className="w-16 h-16 flex items-center justify-center bg-slate-50 rounded-[1.5rem] border border-slate-100 text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-50 transition-all">
                      {s.type === "Sea" ? <Ship size={32} /> : s.type === "Air" ? <Plane size={32} /> : <Truck size={32} />}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 tracking-tight">{s.shipment_id}</h4>
                      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Logistics Route • {s.type}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <span className={`px-5 py-2 rounded-full border shadow-sm text-[10px] font-black uppercase tracking-widest ${
                      s.status === "Delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      s.status === "Delayed" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>
                      {s.status}
                    </span>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock size={14} />
                      <p className="text-xs font-bold uppercase tracking-widest">ETA: {s.eta ? new Date(s.eta).toLocaleDateString() : 'TBD'}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-12 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-50 flex items-center gap-12">
                  <div className="flex-1 text-center">
                    <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Origin</p>
                    <p className="text-xl font-black text-slate-900">{s.origin.split(',')[0]}</p>
                  </div>
                    <div className="flex-[3] relative py-6">
                      <div className="absolute top-1/2 left-0 w-full h-2 bg-slate-100 rounded-full -translate-y-1/2" />
                      <div className={`absolute top-1/2 left-0 h-2 rounded-full -translate-y-1/2 shadow-lg transition-all duration-1000 ${
                        s.payment_status === "overdue" ? "bg-rose-500 shadow-rose-200" : "bg-amber-500 shadow-amber-200"
                      }`} style={{ width: `${s.payment_status === "paid" ? 50 : (s.payment_status === "overdue" ? 0 : 10)}%` }} />
                      <motion.div style={{ left: `${s.payment_status === "paid" ? 50 : (s.payment_status === "overdue" ? 0 : 10)}%` }} 
                        animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                        className={`absolute top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white border-2 rounded-full shadow-xl transition-all ${
                          s.payment_status === "overdue" ? "border-rose-500 text-rose-600" : "border-amber-500 text-amber-600"
                        }`}>
                        {s.type === "Sea" ? <Anchor size={14} /> : <ChevronRight size={16} />}
                      </motion.div>
                    </div>
                  <div className="flex-1 text-center">
                    <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Destination</p>
                    <p className="text-xl font-black text-slate-900">{s.destination.split(',')[0]}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="p-24 bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center text-slate-400 font-black uppercase tracking-widest shadow-sm">
              {isLoading ? "Synchronizing Active Routes..." : fetchError ? "Logistics Engine Offline." : "No matching shipments found."}
            </div>
          )}
      </div>
    </div>
  );
};
export default ShipmentTracking;