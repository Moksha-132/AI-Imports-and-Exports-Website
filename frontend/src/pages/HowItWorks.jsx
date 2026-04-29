import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Upload, Cpu, ShieldCheck, Ship } from 'lucide-react';
const HowItWorks = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Navbar />
      <section className="max-w-7xl mx-auto px-10 py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8 mb-32">
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-tight">
            Simple, automated, <span className="text-amber-500">intelligent</span>.
          </h1>
          <p className="text-2xl text-slate-500 font-medium leading-relaxed">
            Discover how Shnoor transforms messy document workflows into a high-accuracy intelligence engine.
          </p>
        </div>
        <div className="space-y-40">
          {[
            { s: "01", t: "Intake", d: "Upload documents in any format. Our AI immediately extracts key data with field-level validation.", i: Upload, c: "bg-amber-500" },
            { s: "02", t: "Analysis", d: "Neural networks classify products to the correct HSN codes and calculate exact duties and taxes.", i: Cpu, c: "bg-slate-900" },
            { s: "03", t: "Compliance", d: "Transactions are screened against global sanctions and risk profiles to ensure 100% security.", i: ShieldCheck, c: "bg-amber-500" },
            { s: "04", t: "Logistics", d: "Monitor shipments in real-time. Get predictive alerts and track performance via analytics.", i: Ship, c: "bg-slate-900" }
          ].map((item, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-24`}>
              <div className="flex-1 space-y-10">
                <span className="text-[10rem] font-black text-slate-50 block leading-none tracking-tighter">{item.s}</span>
                <div className="space-y-6">
                  <h3 className="text-5xl font-black tracking-tight">{item.t}</h3>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed">{item.d}</p>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className={`w-72 h-72 ${item.c} rounded-[3.5rem] shadow-2xl flex items-center justify-center text-white rotate-3 hover:rotate-0 transition-all duration-500`}>
                  <item.i size={96} strokeWidth={1.5} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-40 bg-slate-900 rounded-[4rem] p-24 text-center space-y-12 shadow-2xl">
          <h2 className="text-6xl font-black text-white tracking-tight leading-tight">Ready to automate?</h2>
          <button onClick={() => navigate('/login')}
            className="px-16 py-6 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black uppercase tracking-widest rounded-2xl text-xl shadow-xl shadow-amber-400/20 transition-all active:scale-95">
            Get Started
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default HowItWorks;
