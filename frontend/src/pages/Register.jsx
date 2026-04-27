import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Globe, ArrowLeft, CheckCircle2, Layout, ShieldCheck, Zap, User, Building2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    company: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-amber-100 overflow-x-hidden">
      {/* Top Navigation */}
      <nav className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/shnoor logoo.png" alt="Shnoor Logo" className="h-10 w-auto" />
          <div className="hidden sm:block">
            <h2 className="text-lg font-bold text-slate-900 leading-tight">SHNOOR INTERNATIONAL</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Trade Intelligence System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:border-amber-500 hover:text-amber-500 transition-all shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        
        {/* Left Side: Brand Narrative */}
        <div className="space-y-12 animate-in slide-in-from-left duration-700 lg:pt-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-100">
              <Zap size={14} /> New Account
            </div>
            
            <h1 className="text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Start your trade <span className="text-amber-500 italic font-serif">intelligence</span> journey.
            </h1>
            
            <p className="text-xl text-slate-500 leading-relaxed max-w-xl">
              Join thousands of global exporters using Shnoor to automate documentation and eliminate customs compliance risks.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Layout, text: "Instant Enterprise Dashboard" },
              { icon: ShieldCheck, text: "Global Tax & Duty Database" },
              { icon: Globe, text: "AI-Powered Documentation" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <item.icon size={20} />
                </div>
                <span className="text-slate-700 font-bold">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="p-8 rounded-3xl bg-amber-50 border border-amber-100 flex items-start gap-5">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-amber-600 uppercase tracking-widest">Global Scale</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                "We scaled our export volume by 40% in just six months after integrating Shnoor's automated HSN classification system."
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Register Form Card */}
        <div className="animate-in slide-in-from-right duration-700">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Layout size={12} /> System Registration
                </div>
                <h3 className="text-4xl font-extrabold text-slate-900">Create your account</h3>
                <p className="text-slate-500">Join the platform to begin automating your trade operations.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                      <input 
                        type="text" 
                        required
                        placeholder="John Doe"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Company Name</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                      <input 
                        type="text" 
                        required
                        placeholder="Global Trade Inc"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                    <input 
                      type="email" 
                      required
                      placeholder="Enter your email"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                    <input 
                      type="password" 
                      required
                      placeholder="Min 8 characters"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] mt-4"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>Create Account <ArrowRight size={20} /></>
                  )}
                </button>

                <div className="pt-6 text-center">
                  <p className="text-sm text-slate-500 font-medium">
                    Already have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-amber-600 font-bold hover:text-amber-700 transition-colors"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
