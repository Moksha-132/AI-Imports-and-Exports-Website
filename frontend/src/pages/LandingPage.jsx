import React from 'react';
import { ArrowRight, BarChart, CheckCircle2, FileText, Cpu, Shield, Globe, Zap, Truck, Search, Mail, Phone, Upload, ShieldCheck, Ship } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const LandingPage = ({ onGetStarted, onNavigate }) => {
  return (
    <div id="top" className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-200">
      <Navbar onNavigate={onNavigate} currentView="landing" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 pt-24 pb-20 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-100">
            <Zap size={14} /> AI-Powered Global Trade Intelligence
          </div>
          
          <h1 className="text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            Automate your <span className="text-amber-500">global trade</span> operations with enterprise AI intelligence.
          </h1>
          
          <p className="text-xl text-slate-500 leading-relaxed max-w-2xl">
            Streamline HSN classification, customs documentation, and risk assessment through a single unified intelligence ecosystem designed for modern exporters.
          </p>

          <div className="flex items-center gap-6 pt-4">
            <button 
              onClick={onGetStarted}
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-10 py-5 rounded-full flex items-center gap-3 shadow-xl shadow-amber-400/20 transition-all active:scale-95 text-lg group"
            >
              Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('features');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white hover:bg-slate-50 text-slate-900 font-bold px-10 py-5 rounded-full border border-slate-200 shadow-sm transition-all text-lg"
            >
              Explore Platform
            </button>
          </div>

          <div className="flex items-center gap-12 pt-10 border-t border-slate-200">
            <div>
              <p className="text-3xl font-extrabold text-slate-900">98%</p>
              <p className="text-sm text-slate-500 font-medium mt-1">OCR Accuracy</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">24/7</p>
              <p className="text-sm text-slate-500 font-medium mt-1">Customs Monitoring</p>
            </div>
          </div>
        </div>

        <div className="flex-1 relative lg:-mt-48">
          <div className="absolute -inset-4 bg-amber-400/10 rounded-[2.5rem] blur-2xl"></div>
          <div className="relative bg-[#0F172A] rounded-[2rem] shadow-2xl overflow-hidden border border-slate-800">
            {/* Live View Mockup */}
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-6">
                <div>
                  <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-1">Customs Intelligence View</p>
                  <h3 className="text-2xl font-bold text-white">Import Declaration #882</h3>
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Risk Rating</p>
                  <p className="text-2xl font-bold text-emerald-400">Secure</p>
                </div>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                  <BarChart className="text-amber-500" size={24} />
                </div>
                <div>
                  <p className="text-white font-bold">HSN AI Suggestion</p>
                  <p className="text-xs text-slate-400">8471.30.00 (99.2% match)</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Workflow Automations</p>
                {[
                  "OCR extraction completed",
                  "Duty & Tax calculation verified",
                  "Sanctions screening passed"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-500" size={18} />
                    <span className="text-slate-300 text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-white">Document Processing</span>
                  <span className="text-sm font-bold text-amber-500">100%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-[2px]">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-8 py-32 border-t border-slate-100">
        <div className="text-center space-y-6 max-w-3xl mx-auto mb-24">
          <h2 className="text-5xl font-extrabold text-slate-900 leading-tight">
            Simple, automated, <span className="text-amber-500 italic font-serif">intelligent</span>.
          </h2>
          <p className="text-xl text-slate-500 leading-relaxed">
            Discover how Shnoor transforms messy document workflows into a streamlined intelligence engine.
          </p>
        </div>

        <div className="space-y-32">
          {[
            { step: "01", title: "Digital Intake", desc: "Upload your invoices, packing lists, and certificates in any format. Our Document AI immediately extracts key data points.", icon: Upload, color: "bg-amber-500" },
            { step: "02", title: "AI Analysis", desc: "Our neural networks classify products to the correct HSN codes and calculate exact duties and taxes based on the latest global regulations.", icon: Cpu, color: "bg-slate-900" },
            { step: "03", title: "Compliance Check", desc: "Every transaction is screened against global sanctions, risk profiles, and local jurisdiction requirements.", icon: ShieldCheck, color: "bg-amber-500" },
            { step: "04", title: "Logistics Oversight", desc: "Monitor your shipments in real-time. Get predictive alerts on potential delays and track your trade performance.", icon: Ship, color: "bg-slate-900" }
          ].map((item, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-20`}>
              <div className="flex-1 space-y-8">
                <span className="text-8xl font-black text-slate-100 block leading-none">{item.step}</span>
                <div className="space-y-4">
                  <h3 className="text-4xl font-bold">{item.title}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className={`w-64 h-64 ${item.color} rounded-[3rem] shadow-2xl flex items-center justify-center text-white rotate-3 hover:rotate-0 transition-transform duration-500`}>
                  <item.icon size={80} strokeWidth={1.5} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-slate-900 py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 max-w-3xl mx-auto mb-24">
            <h2 className="text-5xl font-extrabold text-white leading-tight">
              Powerful tools for <span className="text-amber-500">global logistics</span>.
            </h2>
            <p className="text-xl text-slate-400">
              Our modular intelligence platform provides everything you need to automate customs and classify products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Document AI & OCR", desc: "Instant extraction of data from invoices, packing lists, and B/L with machine learning.", icon: FileText },
              { title: "AI HSN Classifier", desc: "Identify the correct 6, 8, or 10-digit HSN codes with over 99% accuracy.", icon: Search },
              { title: "Global Duty Engine", desc: "Real-time tax and duty calculations across all global corridors with FTA support.", icon: Globe },
              { title: "Predictive Risk Scoring", desc: "Detect payment delays and compliance issues before they affect your bottom line.", icon: Shield },
              { title: "End-to-End Tracking", desc: "Real-time monitoring of air, sea, and land shipments with automated alerts.", icon: Zap },
              { title: "Advanced Analytics", desc: "Visualize your trade volume, duty savings, and operational performance.", icon: BarChart }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-800 p-10 rounded-[3rem] border border-white/5 shadow-xl group hover:border-amber-500/50 transition-all">
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-8 group-hover:scale-110 transition-transform">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed mb-8">{feature.desc}</p>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                  <CheckCircle2 className="text-amber-500" size={16} /> Enterprise Grade
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-32 px-8 overflow-hidden relative border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 relative z-10">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-100">
              Our Story
            </div>
            <h2 className="text-6xl font-extrabold leading-tight text-slate-900">Redefining global <span className="text-amber-500 italic font-serif">intelligence</span>.</h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Shnoor International combines deep domain expertise in logistics with cutting-edge AI to solve the industry's most complex trade challenges.
            </p>
            <div className="grid grid-cols-2 gap-12 pt-10 border-t border-slate-100">
              <div>
                <p className="text-5xl font-black text-amber-500">2025</p>
                <p className="text-sm text-slate-400 font-bold uppercase mt-2">Founded</p>
              </div>
              <div>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">Global</p>
                <p className="text-sm text-slate-400 font-bold uppercase mt-2">Operations</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-[3rem] p-12 space-y-8 shadow-sm">
            <h3 className="text-3xl font-bold italic font-serif text-slate-900">"Global trade should be accessible, transparent, and automated."</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              We envision a world where borders are no longer barriers to commerce. Through continuous innovation, Shnoor is building the digital infrastructure for a truly global economy.
            </p>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LandingPage;
