import React, { useState } from 'react';
import { Search, Info, Cpu, Check, AlertCircle } from 'lucide-react';

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
    
    fetch('http://localhost:8000/hsn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: query })
    })
    .then(res => {
      if (!res.ok) throw new Error("Classification failed. Please ensure the backend is running.");
      return res.json();
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
      console.error("HSN Error:", err);
      setError(err.message);
      setIsClassifying(false);
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="glass-card p-12 bg-white">
        <h3 className="text-3xl font-black text-slate-900 mb-6">Global Product Classifier</h3>
        <p className="text-lg text-slate-500 mb-10 max-w-2xl font-medium">
          Enter your product description to identify the correct HSN code for international trade compliance and tariff estimation.
        </p>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Lithium-ion battery pack for industrial storage..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-3xl pl-14 pr-6 py-5 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all text-lg font-medium shadow-sm"
            />
          </div>
          <button 
            type="submit" 
            className="bg-black text-white font-black uppercase tracking-widest px-10 py-5 rounded-3xl hover:bg-slate-900 transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center gap-3 whitespace-nowrap" 
            disabled={isClassifying}
          >
            {isClassifying ? <Cpu className="animate-spin" size={24} /> : <Search size={24} />}
            <span className="text-lg uppercase tracking-wider">{isClassifying ? 'Analyzing...' : 'Search Code'}</span>
          </button>
        </form>
      </div>

      {results.length > 0 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Info className="text-amber-500" />
            Verified Classifications
          </h4>
          <div className="grid grid-cols-1 gap-6">
            {results.map((res, idx) => (
              <div key={idx} className="glass-card p-8 border-l-8 border-amber-500 hover:border-amber-400 transition-all cursor-pointer group bg-white">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-mono font-black text-slate-900">{res.code}</span>
                      <span className="bg-amber-50 text-amber-600 text-[10px] px-4 py-2 rounded-full font-black uppercase tracking-widest border border-amber-100 flex items-center gap-2">
                        <Check size={14} /> System Verified
                      </span>
                    </div>
                    <p className="text-lg text-slate-500 font-bold">{res.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-3">Accuracy Match</p>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-3 bg-slate-100 rounded-full overflow-hidden p-[2px]">
                        <div className="h-full bg-slate-900 rounded-full" style={{ width: res.confidence }}></div>
                      </div>
                      <span className="text-slate-900 font-black text-xl">{res.confidence}</span>
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
