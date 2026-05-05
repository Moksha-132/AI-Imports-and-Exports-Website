import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Scale, BookOpen, UserCheck, AlertTriangle, HelpCircle, ChevronRight, ShieldAlert, Gavel, Cpu, Globe, ArrowUpRight, Shield, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';

const TermsConditions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(1);
  const isFromLogin = new URLSearchParams(location.search).get('from') === 'login';

  const sections = [
    { id: 1, title: "Acceptance of Terms", icon: BookOpen },
    { id: 2, title: "Account Governance", icon: UserCheck },
    { id: 3, title: "Service Restrictions", icon: ShieldAlert },
    { id: 4, title: "Liability Protocol", icon: Gavel },
    { id: 5, title: "Platform Integrity", icon: Cpu }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 text-slate-700 selection:text-slate-900">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-blue-400/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-slate-400/5 rounded-full blur-[120px]"></div>
      </div>

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="p-2 bg-slate-900 rounded-xl group-hover:rotate-12 transition-transform duration-500">
              <img src="/shnoor logoo.png" alt="Shnoor Logo" className="h-8 w-auto brightness-200" />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-lg font-black text-slate-900 leading-tight tracking-tight uppercase">Shnoor <span className="text-blue-600 font-serif lowercase italic">Legal</span></h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Compliance Engine v1.2</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
          >
            <ArrowLeft size={16} className="text-blue-500" /> Return to Home
          </button>
        </div>
      </nav>

      <header className="relative pt-24 pb-16 overflow-hidden border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-6 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
                <Scale size={12} /> Master Service Agreement
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                Terms of <br />
                <span className="text-blue-600 italic font-serif">Engagement</span>
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed font-medium">
                Comprehensive governance for the Shnoor Trade Intelligence platform. 
                By accessing our infrastructure, you agree to these operational protocols.
              </p>
            </div>
            <div className="pb-2">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 text-center">Version Control</p>
                <p className="text-slate-900 font-bold text-lg uppercase">MS-2026.04-L</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-20">
        <div className="flex flex-col lg:flex-row gap-20">
          {/* Navigation */}
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-32 space-y-1">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-6 pl-4">Legal Framework</p>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    document.getElementById(`section-${section.id}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                    activeSection === section.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                    : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <section.icon size={18} className={activeSection === section.id ? 'text-white' : 'text-slate-300 group-hover:text-blue-600'} />
                    <span className="font-bold text-sm tracking-tight">{section.title}</span>
                  </div>
                  <ChevronRight size={14} className={activeSection === section.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                </button>
              ))}
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 space-y-32">
            
            <section id="section-1" className="scroll-mt-40 space-y-8 group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                  <BookOpen size={28} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">1. Acceptance of Terms</h2>
                <p className="text-slate-500 text-lg leading-relaxed max-w-3xl">
                  Welcome to Shnoor International. By accessing our website and using our AI-driven trade intelligence services, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, you must cease using our services immediately.
                </p>
              </div>
            </section>

            <section id="section-2" className="scroll-mt-40 space-y-8 group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-sm">
                  <UserCheck size={28} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">2. Account Governance</h2>
                <p className="text-slate-500 text-lg leading-relaxed max-w-3xl">
                  Registration grants you a non-exclusive, revocable license to utilize the Shnoor intelligence infrastructure.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group/card">
                  <h4 className="text-slate-900 font-black text-lg mb-4 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 shadow-lg shadow-blue-500/50" /> Organizational Identity
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">You must represent a valid legal entity and provide verifiable corporate identity records to access enterprise-tier intelligence.</p>
                </div>
                <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group/card">
                  <h4 className="text-slate-900 font-black text-lg mb-4 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 shadow-lg shadow-blue-500/50" /> Credential Integrity
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">Any breach of credential security must be reported immediately to our security response team.</p>
                </div>
              </div>
            </section>

            <section id="section-3" className="scroll-mt-40 space-y-8 group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-sm">
                  <ShieldAlert size={28} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">3. Service Restrictions</h2>
                <p className="text-slate-500 text-lg leading-relaxed max-w-3xl">
                  To maintain the integrity of our global trade network, the following behaviors are strictly prohibited:
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Systematic data scraping",
                  "Reverse engineering AI models",
                  "Illicit trade activities",
                  "Isolation protocol bypass"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-6 rounded-2xl bg-white border border-slate-100 text-slate-700 font-bold shadow-sm group-hover:border-red-200 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                      <AlertTriangle size={16} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section id="section-4" className="scroll-mt-40 space-y-8 group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                  <Gavel size={28} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">4. Liability Protocol</h2>
                <div className="relative p-12 rounded-[3rem] bg-slate-900 text-white shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <p className="text-slate-300 text-xl leading-relaxed italic relative z-10 font-serif">
                    "Shnoor International provides AI-based insights for informational purposes. While we strive for 100% accuracy, we are not liable for any financial losses resulting from customs non-compliance or trade delays. Users should verify critical data with official customs authorities."
                  </p>
                </div>
              </div>
            </section>

            <section id="section-5" className="scroll-mt-40 space-y-8 group text-center max-w-3xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/20 mx-auto">
                <HelpCircle size={28} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Need Legal Clarification?</h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                Our compliance team is available to discuss enterprise-specific legal frameworks and custom service level agreements.
              </p>
              <div className="pt-6">
                <button 
                  onClick={() => navigate('/contact')}
                  className="px-12 py-5 rounded-full bg-slate-900 text-white font-black hover:bg-blue-600 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
                >
                  Contact Legal Support <ArrowUpRight size={20} />
                </button>
              </div>
            </section>
            
            {isFromLogin && (
              <div className="pt-12 flex flex-col items-center gap-6 border-t border-slate-100">
                <button 
                  onClick={() => {
                    localStorage.setItem('terms_accepted', 'true');
                    navigate('/login');
                  }}
                  className="px-12 py-5 rounded-full bg-slate-900 text-white font-black hover:bg-blue-600 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                  Accept & Return to Login <ArrowRight size={20} />
                </button>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                  By clicking accept, you agree to our Master Service Agreement
                </p>
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsConditions;
