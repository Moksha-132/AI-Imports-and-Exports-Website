import React, { useState } from 'react';
import { Search, Info, Cpu, Check, AlertCircle } from 'lucide-react';
import { apiFetch } from '../api';

const HSNSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsClassifying(true);
    setError(null);
    
    apiFetch('/hsn', {
      method: 'POST',
      body: JSON.stringify({ description: query })
    })
    .then(data => {
      setResults([{
        code: data.hsn_code,
        category: data.product_desc,
        confidence: (data.confidence * 100).toFixed(1) + "%",
        logic: data.ai_logic
      }]);
      setIsClassifying(false);
    })
    .catch(err => {
      setError(err.message);
      setIsClassifying(false);
    });
  };
  return (
    <div className="space-y-8 pb-12">
      {error && (
        <div className="p-6 flex items-center gap-4 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-600 font-bold animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={24} />
          <span>{error}</span>
        </div>
      )}
      <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Product Classifier</h3>
        <p className="max-w-2xl text-lg text-slate-500 font-medium mb-12">Enter product details to identify the correct HSN code for international trade compliance.</p>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search product description..." 
              className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-lg font-medium outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-sm" />
          </div>
          <button type="submit" disabled={isClassifying}
            className="px-12 py-5 bg-slate-900 text-white font-black uppercase tracking-widest rounded-[1.5rem] shadow-xl hover:bg-black transition-all active:scale-95 flex items-center gap-4">
            {isClassifying ? <Cpu className="animate-spin" size={24} /> : <Search size={24} />}
            <span className="text-lg">{isClassifying ? 'Analyzing...' : 'Search'}</span>
          </button>
        </form>
      </div>
      {results.length > 0 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <h4 className="flex items-center gap-3 text-2xl font-black text-slate-900 tracking-tight">
            <Info className="text-amber-500" />
            Verified Classifications
          </h4>
          <div className="grid grid-cols-1 gap-6">
            {results.map((res, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm border-l-8 border-l-amber-500 hover:border-amber-400 transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-6">
                      <span className="text-4xl font-mono font-black text-slate-900 tracking-tighter">{res.code}</span>
                      <span className="px-5 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-2">
                        <Check size={14} /> System Verified
                      </span>
                    </div>
                    <p className="text-xl text-slate-500 font-bold">{res.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Match Accuracy</p>
                    <div className="flex items-center gap-5">
                      <div className="w-40 h-3 p-[2px] bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full shadow-sm" style={{ width: res.confidence }} />
                      </div>
                      <span className="text-2xl font-black text-slate-900">{res.confidence}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default HSNSearch;
