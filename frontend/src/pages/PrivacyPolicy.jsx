import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText, Bell, Scale, Mail, ChevronRight, Fingerprint, Globe, ShieldCheck, ArrowUpRight, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(1);
  const isFromLogin = new URLSearchParams(location.search).get('from') === 'login';

  const sections = [
    { id: 1, title: "Information Collection", icon: Eye },
    { id: 2, title: "Data Usage", icon: FileText },
    { id: 3, title: "Information Security", icon: ShieldCheck },
    { id: 4, title: "Legal Disclosure", icon: Scale },
    { id: 5, title: "Policy Updates", icon: Bell },
    { id: 6, title: "Contact Support", icon: Mail }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-amber-100 text-slate-700 selection:text-slate-900">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-amber-400/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[120px]"></div>
      </div>

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="p-2 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform duration-500">
              <img src="/shnoor logoo.png" alt="Shnoor Logo" className="h-8 w-auto brightness-200" />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-lg font-black text-slate-900 leading-tight tracking-tight uppercase">Shnoor <span className="text-amber-500">Intl</span></h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Privacy Protocol v2.2</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
          >
            <ArrowLeft size={16} className="text-amber-500" /> Back to Home
          </button>
        </div>
      </nav>

      <header className="relative pt-24 pb-16 overflow-hidden border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-6 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-amber-100">
                <Fingerprint size={12} /> Data Privacy
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                Privacy <span className="text-slate-300">&</span> <br />
                Security <span className="text-amber-500 italic font-serif">Standards</span>
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed font-medium">
                Our global privacy framework ensures your trade data is handled with the highest integrity.
                Explore our transparent data governance protocols.
              </p>
            </div>
            <div className="pb-2">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Effective Date</p>
                <p className="text-slate-900 font-bold text-lg">May 04, 2026</p>
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
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-6 pl-4">Governance Framework</p>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    document.getElementById(`section-${section.id}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                    activeSection === section.id 
                    ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' 
                    : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <section.icon size={18} className={activeSection === section.id ? 'text-white' : 'text-slate-300 group-hover:text-amber-500'} />
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
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100 shadow-sm">
                  <Eye size={28} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">1. Information Collection</h2>
                <p className="text-slate-500 text-lg leading-relaxed max-w-3xl">
                  We collect information to provide better services to all our users. This includes information you provide to us, such as your name, email address, and company details when you register for an account.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Account Identity", desc: "Secure storage of email, multi-factor auth tokens, and organizational roles.", icon: UserCheck },
                  { title: "Trade Intelligence", desc: "Machine-processed invoice metadata, HSN classifications, and logistics patterns.", icon: Database }
                ].map((item, i) => (
                  <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-amber-500/20 transition-all duration-500 group/item">
                    <h4 className="text-slate-900 font-bold text-lg mb-2">{item.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="section-2" className="scroll-mt-40 space-y-8 group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100 shadow-sm">
                  <FileText size={28} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">2. How We Use Information</h2>
                <p className="text-slate-500 text-lg leading-relaxed max-w-3xl">
                  Our usage patterns are strictly limited to the operational enhancement of your trade workflows and system security.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "AI HSN classification engine",
                  "Trade document verification",
                  "Security anomaly detection",
                  "Operational platform optimization"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-6 rounded-2xl bg-white border border-slate-100 text-slate-600 font-bold shadow-sm group-hover:border-blue-200 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-lg" />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section id="section-3" className="scroll-mt-40 space-y-10 group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shadow-sm">
                  <ShieldCheck size={28} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">3. Information Security</h2>
                <p className="text-slate-600 text-xl leading-relaxed max-w-3xl font-bold italic font-serif">
                  "We secure information you provide on computer servers in a controlled, secure environment, protected from unauthorized access, use, or disclosure."
                </p>
              </div>
              
              <div className="relative p-12 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                <div className="relative z-10 space-y-8">
                  <p className="text-slate-500 text-lg leading-relaxed">
                    We keep reasonable administrative, technical, and physical safeguards to protect against unauthorized access, use, modification, and personal data disclosure in its control and custody. 
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-8 border-t border-slate-100">
                    <div className="space-y-3">
                      <p className="text-amber-500 font-black text-[10px] uppercase tracking-widest">Administrative</p>
                      <h4 className="text-slate-900 font-bold text-xl uppercase tracking-tighter">Controlled Environment</h4>
                      <p className="text-slate-500 text-sm">Strictly audited data centers with biometric and cryptographic access controls.</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-blue-500 font-black text-[10px] uppercase tracking-widest">Technical</p>
                      <h4 className="text-slate-900 font-bold text-xl uppercase tracking-tighter">Encrypted Custody</h4>
                      <p className="text-slate-500 text-sm">Advanced AES-256 encryption for data at rest and TLS 1.3 for all global transit.</p>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-slate-400 text-sm italic">
                      <span className="text-slate-900 font-black not-italic uppercase tracking-widest mr-2">Notice:</span> However, no data transmission over the Internet or wireless network can be guaranteed.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="section-4" className="scroll-mt-40 space-y-8 group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                  <Scale size={28} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">4. Legal Disclosure</h2>
                <div className="p-12 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <p className="text-slate-300 text-xl leading-relaxed italic font-serif relative z-10">
                    "We will disclose any information we collect, use or receive if required or permitted by law, such as to comply with a subpoena or similar legal process, and when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request."
                  </p>
                </div>
              </div>
            </section>

            <section id="section-5" className="scroll-mt-40 space-y-8 group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center border border-purple-100 shadow-sm">
                  <Bell size={28} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">5. Policy Updates</h2>
                <p className="text-slate-500 text-lg leading-relaxed max-w-3xl font-medium">
                  Our Privacy Policy may evolve alongside global trade regulations. We will post any changes on this page and, for significant updates, provide prominent system-wide notifications.
                </p>
              </div>
            </section>

            <section id="section-6" className="scroll-mt-40 space-y-8 group text-center max-w-3xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/20 mx-auto">
                <Mail size={28} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">6. Contact Information</h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                If you have inquiries regarding this Policy or your personal data rights, please contact our global privacy team:
              </p>
              <div className="pt-6">
                <a 
                  href="mailto:info@shnoor.com" 
                  className="inline-flex items-center gap-6 p-8 rounded-[2rem] bg-white text-slate-900 group/mail hover:bg-slate-900 hover:text-white transition-all duration-500 shadow-xl border border-slate-100"
                >
                  <div className="p-4 bg-amber-500 rounded-2xl text-white transition-colors">
                    <Mail size={32} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-50">Direct Inquiry Line</p>
                    <p className="text-3xl font-black tracking-tight">info@shnoor.com</p>
                  </div>
                  <ArrowUpRight className="opacity-0 group-hover/mail:opacity-100 group-hover/mail:translate-x-1 group-hover/mail:-translate-y-1 transition-all" size={24} />
                </a>
              </div>
              {isFromLogin && (
                <div className="pt-12 flex flex-col items-center gap-6">
                  <button 
                    onClick={() => {
                      localStorage.setItem('privacy_accepted', 'true');
                      navigate('/login');
                    }}
                    className="px-12 py-5 rounded-full bg-slate-900 text-white font-black hover:bg-amber-500 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3"
                  >
                    Accept & Return to Login <ArrowRight size={20} />
                  </button>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                    By clicking accept, you agree to our data governance standards
                  </p>
                </div>
              )}
          </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const UserCheck = ({ size, className }) => <Shield size={size} className={className} />;
const Database = ({ size, className }) => <Globe size={size} className={className} />;

export default PrivacyPolicy;
