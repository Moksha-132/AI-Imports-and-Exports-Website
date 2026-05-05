import React, { useState, useEffect } from 'react';
import { Ship, Truck, Plane, MapPin, Search, Filter, Clock, MoreVertical, CheckCircle, AlertCircle, ChevronRight, Anchor, Edit3, Trash2, X, Save, Activity, Target, Radio, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Line, Marker } from "react-simple-maps";
import { apiFetch } from '../api';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const ShipmentTracking = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [allShipments, setAllShipments] = useState([]);
  const [liveData, setLiveData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  
  // Administrative State
  const [editingShipment, setEditingShipment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState(null);

  const synchronizeShipments = async () => {
    try {
      const [listData, trackingData] = await Promise.all([
        apiFetch('/shipments'),
        apiFetch('/shipments/live')
      ]);
      setAllShipments(Array.isArray(listData) ? listData : []);
      setLiveData(Array.isArray(trackingData) ? trackingData : []);
    } catch (err) {
      console.error("Logistics synchronization failed:", err);
      setFetchError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    synchronizeShipments();
    const interval = setInterval(synchronizeShipments, 10000); // Sync every 10s
    return () => clearInterval(interval);
  }, []);

  const handleStopShipment = async (id) => {
    if (!window.confirm("Are you sure you want to stop this shipment process?")) return;
    try {
      await apiFetch(`/shipments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Stopped' })
      });
      synchronizeShipments();
    } catch (err) {
      alert("Failed to stop shipment");
    }
  };

  const handleDeleteShipment = async (id) => {
    if (!window.confirm("CRITICAL: This will permanently remove the shipment, ledger records, and associated analytics. Proceed?")) return;
    try {
      await apiFetch(`/shipments/${id}`, {
        method: 'DELETE'
      });
      synchronizeShipments();
    } catch (err) {
      alert("Logistics termination failed");
    }
  };

  const handleUpdateShipment = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/shipments/${editingShipment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: editingShipment.status,
          eta: editingShipment.eta,
          carrier: editingShipment.carrier
        })
      });
      setIsEditModalOpen(false);
      synchronizeShipments();
    } catch (err) {
      alert("Failed to update shipment");
    }
  };

  const filteredShipments = allShipments.filter(shipment => {
    const matchesFilter = activeFilter === 'All' || 
                         shipment.type === activeFilter || 
                         (activeFilter === 'Delayed' && shipment.status === 'Delayed') ||
                         (activeFilter === 'Stopped' && shipment.status === 'Stopped');
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch = (shipment.shipment_id || '').toLowerCase().includes(normalizedSearch) || 
                         (shipment.origin || '').toLowerCase().includes(normalizedSearch) || 
                         (shipment.destination || '').toLowerCase().includes(normalizedSearch);
    return matchesFilter && matchesSearch;
  });

  const getLivePosition = (id) => {
    return liveData.find(ld => ld.id === id);
  };

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
          {['All', 'Sea', 'Air', 'Land', 'Delayed', 'Stopped'].map((t) => (
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
          {filteredShipments.length > 0 ? filteredShipments.map((s, idx) => {
            const livePos = getLivePosition(s.id);
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                id={`shipment-${s.id}`}
                className={`bg-white rounded-[2.5rem] border shadow-sm border-l-8 hover:border-l-amber-500 hover:border-amber-500/40 transition-all group cursor-pointer overflow-hidden ${
                  selectedMapId === s.id ? 'border-amber-500 border-l-amber-500 ring-4 ring-amber-500/5' : 'border-slate-100 border-l-slate-100'
                }`}
              >
                <div className="p-10">
                  <div className="flex justify-between items-start mb-10">
                    <div className="flex gap-6">
                      <div className="w-16 h-16 flex items-center justify-center bg-slate-50 rounded-[1.5rem] border border-slate-100 text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-50 transition-all">
                        {s.type === "Sea" ? <Ship size={32} /> : s.type === "Air" ? <Plane size={32} /> : <Truck size={32} />}
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{s.shipment_id}</h4>
                        <div className="flex items-center gap-3 mt-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Logistics Route • {s.type}</p>
                          {livePos && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50/50 backdrop-blur-sm rounded-full border border-emerald-100/50 shadow-sm shadow-emerald-500/10">
                              <Activity size={10} className="text-emerald-500 animate-pulse" />
                              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active Tracking</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-5 py-2 rounded-xl border shadow-sm text-[10px] font-black uppercase tracking-widest transition-colors ${
                          s.status === "Delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          s.status === "Delayed" ? "bg-rose-50 text-rose-600 border-rose-100" : 
                          s.status === "Stopped" ? "bg-slate-100 text-slate-600 border-slate-200" : 
                          "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/10"
                        }`}>
                          {s.status}
                        </span>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock size={12} />
                          <p className="text-[9px] font-black uppercase tracking-[0.1em]">ETA: {s.eta ? new Date(s.eta).toLocaleDateString() : 'TBD'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingShipment(s);
                            setIsEditModalOpen(true);
                          }}
                          className="p-3 bg-white text-slate-400 hover:text-amber-600 hover:border-amber-200 border border-slate-100 rounded-xl transition-all shadow-sm active:scale-90"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteShipment(s.id);
                          }}
                          className="p-3 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 border border-slate-100 rounded-xl transition-all shadow-sm active:scale-90"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 p-10 bg-slate-50/40 rounded-[2.5rem] border border-slate-100/50 flex items-center gap-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                    <div className="flex-1 text-center relative z-10">
                      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Point of Origin</p>
                      <p className="text-xl font-black text-slate-900 tracking-tight">{(s.origin || '').split(',')[0]}</p>
                    </div>
                      <div className="flex-[4] relative py-6">
                        <div className="absolute top-1/2 left-0 w-full h-2.5 bg-slate-200/50 rounded-full -translate-y-1/2" />
                        <div className={`absolute top-1/2 left-0 h-2.5 rounded-full -translate-y-1/2 shadow-lg transition-all duration-[2000ms] ease-in-out ${
                          s.status === "Delayed" ? "bg-gradient-to-r from-rose-500 to-rose-400 shadow-rose-200" : "bg-gradient-to-r from-amber-500 to-orange-400 shadow-amber-200"
                        }`} style={{ width: `${(livePos ? livePos.progress : s.progress) || 10}%` }} />
                        <motion.div style={{ left: `${(livePos ? livePos.progress : s.progress) || 10}%` }} 
                          animate={{ scale: [1, 1.15, 1], boxShadow: ["0 0 0px rgba(245, 158, 11, 0)", "0 0 20px rgba(245, 158, 11, 0.4)", "0 0 0px rgba(245, 158, 11, 0)"] }} 
                          transition={{ duration: 2.5, repeat: Infinity }}
                          className={`absolute top-1/2 -translate-y-1/2 z-10 p-2 bg-white border-2 rounded-full shadow-2xl transition-all duration-[2000ms] ease-in-out ${
                            s.status === "Delayed" ? "border-rose-500 text-rose-600" : "border-amber-500 text-amber-600"
                          }`}>
                          {s.type === "Sea" ? <Ship size={16} /> : s.type === "Air" ? <Plane size={16} /> : <Truck size={16} />}
                        </motion.div>
                      </div>
                    <div className="flex-1 text-center relative z-10">
                      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Final Destination</p>
                      <p className="text-xl font-black text-slate-900 tracking-tight">{(s.destination || '').split(',')[0]}</p>
                    </div>
                  </div>
                  
                  {livePos && (
                    <div className="mt-8 flex justify-center">
                       <div className="flex flex-col md:flex-row items-center gap-5 px-8 py-4 bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-900/20 border border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/80">Global Positioning</span>
                          </div>
                          <div className="hidden md:block w-px h-6 bg-slate-800" />
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="text-xs font-black text-white tracking-tight">{livePos.current_location}</span>
                          </div>
                          <div className="hidden md:block w-px h-6 bg-slate-800" />
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-400 tracking-widest font-mono">
                              {livePos.current_lat.toFixed(4)}° {livePos.current_lat >= 0 ? 'N' : 'S'}
                            </span>
                            <span className="text-xs font-black text-slate-400 tracking-widest font-mono">
                              {livePos.current_lng.toFixed(4)}° {livePos.current_lng >= 0 ? 'E' : 'W'}
                            </span>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          }) : (
            <div className="p-32 bg-white border-2 border-dashed border-slate-100 rounded-[3rem] text-center text-slate-400 font-black uppercase tracking-widest shadow-sm">
              {isLoading ? "Synchronizing Active Routes..." : fetchError ? "Logistics Engine Offline." : "No matching shipments found."}
            </div>
          )}
      </div>
      <section className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden border-8 border-slate-800">
        <div className="absolute top-10 left-10 z-10 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Live Global Fleet</span>
          </div>
          <h3 className="text-white font-black text-2xl tracking-tight">Active Tracking Protocol</h3>
        </div>
        <div className="aspect-[21/9] w-full mt-10">
          <ComposableMap projectionConfig={{ scale: 140 }}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#334155", outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
            {liveData.map((shipment) => (
              <React.Fragment key={shipment.id}>
                {shipment.route_path ? (
                  shipment.route_path.map((point, i) => {
                    if (i === 0) return null;
                    const prev = shipment.route_path[i-1];
                    return (
                      <Line
                        key={`${shipment.id}-seg-${i}`}
                        from={[prev.lng, prev.lat]}
                        to={[point.lng, point.lat]}
                        stroke="#fbbf24"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        opacity={0.3}
                      />
                    );
                  })
                ) : (
                  <Line
                    from={[shipment.origin_lng, shipment.origin_lat]}
                    to={[shipment.dest_lng, shipment.dest_lat]}
                    stroke="#fbbf24"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    opacity={0.2}
                  />
                )}
                <Marker coordinates={[shipment.current_lng, shipment.current_lat]}>
                  <g 
                    onClick={() => {
                      setSelectedMapId(shipment.id);
                      document.getElementById(`shipment-${shipment.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="cursor-pointer transition-transform duration-300 hover:scale-125"
                  >
                    <circle r={10} fill="#fbbf24" opacity={0.2}>
                      <animate attributeName="r" from="10" to="25" dur="3s" begin="0s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.2" to="0" dur="3s" begin="0s" repeatCount="indefinite" />
                    </circle>
                    <circle r={5} fill={selectedMapId === shipment.id ? "#f59e0b" : "#fbbf24"} stroke="#fff" strokeWidth={2} />
                    <foreignObject x="-10" y="-10" width="20" height="20">
                      <div className="w-full h-full flex items-center justify-center text-white">
                         {shipment.type === "Sea" ? <Ship size={8} /> : shipment.type === "Air" ? <Plane size={8} /> : <Truck size={8} />}
                      </div>
                    </foreignObject>
                  </g>
                </Marker>
              </React.Fragment>
            ))}
          </ComposableMap>
        </div>
      </section>

      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Modify Shipment</h3>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleUpdateShipment} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Process Status</label>
                    <select 
                      value={editingShipment.status}
                      onChange={(e) => setEditingShipment({...editingShipment, status: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:border-amber-500 transition-all"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delayed">Delayed</option>
                      <option value="Stopped">Stopped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Update ETA</label>
                    <input 
                      type="date"
                      value={editingShipment.eta ? new Date(editingShipment.eta).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditingShipment({...editingShipment, eta: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:border-amber-500 transition-all"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/10"
                  >
                    <Save size={20} /> Update Logistics Data
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ShipmentTracking;