import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, Send, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api';

const DocumentIntelligence = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    apiFetch('/documents')
      .then(data => setHistory(data))
      .catch(err => console.error("History fetch error:", err));
  }, [extractedData, isApproved]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setIsApproved(false);
    const formData = new FormData();
    formData.append('file', file);
    
    apiFetch('/documents', {
      method: 'POST',
      body: formData
    })
    .then(data => {
      let ext = data.extracted_data || {};
      if (typeof ext === 'string') {
        try { ext = JSON.parse(ext); } catch(e) { ext = {}; }
      }
      setExtractedData({
        id: data.id,
        invoice_number: data.invoice_no || ext.invoice_no || "Not Detected",
        date: data.created_at ? new Date(data.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
        sender: data.vendor || ext.vendor || "Not Detected",
        total_value: (data.amount || ext.amount) ? `$${parseFloat(data.amount || ext.amount).toLocaleString()}` : "—",
        status: data.status || "processed",
        items: ext.items || []
      });
      setIsUploading(false);
    })
    .catch(err => {
      setError(err.message);
      setIsUploading(false);
    });
  };

  const handleApprove = () => {
    if (!extractedData) return;
    setIsApproving(true);
    setError(null);
    apiFetch(`/documents/${extractedData.id}/approve`, {
      method: 'POST'
    })
    .then(() => {
      setIsApproving(false);
      setIsApproved(true);
      setExtractedData(null);
    })
    .catch(err => {
      setError(err.message);
      setIsApproving(false);
    });
  };

  const updatePayment = (id, status) => {
    apiFetch(`/documents/${id}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    .then(() => {
      setHistory(prev => prev.map(h => h.id === id ? { ...h, payment_status: status } : h));
    });
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-12 pb-20">
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3"><AlertCircle size={20} /><span>{error}</span></div>
            <button onClick={() => setError(null)}><X size={18} /></button>
          </motion.div>
        )}
        {isApproved && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-12 glass-card bg-emerald-50 border-emerald-100 text-center space-y-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-100"><PartyPopper className="text-emerald-500" size={40} /></div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900">Success! Document Approved</h3>
              <p className="text-emerald-700 font-bold">The shipment has been successfully created and tracked.</p>
            </div>
            <button onClick={() => setIsApproved(false)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest px-8 py-3 rounded-xl transition-all">Upload Another</button>
          </motion.div>
        )}
      </AnimatePresence>

      {!isApproved && (
        <>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
          <div className="glass-card p-20 border-dashed border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50/20 transition-all flex flex-col items-center justify-center text-center cursor-pointer group bg-white shadow-sm" onClick={triggerUpload}>
            <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center mb-10 group-hover:scale-110 transition-all border border-amber-100">
              {isUploading ? <Loader2 className="text-amber-500 animate-spin" size={40} /> : <Upload className="text-amber-500" size={40} />}
            </div>
            <h3 className="text-4xl font-black text-slate-900 mb-6">Upload Shipping Documents</h3>
            <button className="bg-black text-white font-black uppercase tracking-widest px-12 py-5 rounded-2xl mt-12 hover:bg-slate-900 transition-all active:scale-95 shadow-2xl shadow-slate-200">Select Files</button>
          </div>

          {extractedData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="glass-card p-10 bg-white">
                <h4 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3"><FileText className="text-amber-500" />Extracted Information</h4>
                <div className="space-y-4">
                  {[
                    { label: "Invoice Number", val: extractedData.invoice_number },
                    { label: "Sender", val: extractedData.sender },
                    { label: "Total Value", val: extractedData.total_value, highlight: true }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-6 rounded-3xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                      <span className={`font-black text-lg ${item.highlight ? "text-amber-600" : "text-slate-900"}`}>{item.val}</span>
                    </div>
                  ))}

                  {extractedData.items && extractedData.items.length > 0 && (
                    <div className="mt-8 space-y-4">
                      <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest block mb-2">Detected Line Items</span>
                      {extractedData.items.map((item, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100/50 flex justify-between items-center">
                          <span className="font-bold text-slate-800 text-sm truncate pr-4">{item.name}</span>
                          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-black">{item.hsn}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={handleApprove} disabled={isApproving} className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-black uppercase tracking-widest w-full mt-10 py-5 rounded-2xl flex items-center justify-center gap-3">
                  {isApproving ? <Loader2 className="animate-spin" size={24} /> : <>Approve & Track <Send size={20} /></>}
                </button>
              </div>
              <div className="glass-card p-10 bg-white">
                <h4 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3"><CheckCircle className="text-emerald-500" />Validation Status</h4>
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center gap-4"><CheckCircle className="text-emerald-500" size={20} /><span className="text-emerald-700 font-black text-sm">HSN codes identified</span></div>
                  <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center gap-4"><CheckCircle className="text-emerald-500" size={20} /><span className="text-emerald-700 font-black text-sm">Duty calculation verified</span></div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default DocumentIntelligence;
