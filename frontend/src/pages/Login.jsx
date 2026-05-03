import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Globe, ArrowLeft, Sun, CheckCircle2, Layout, ShieldCheck, Zap } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('full_name', data.full_name);
        navigate('/dashboard');
      } else {
        const data = await response.json();
        setError(data.detail || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
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
              <Zap size={14} /> Welcome Back
            </div>
            
            <h1 className="text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Continue your trade <span className="text-amber-500 italic font-serif">intelligence</span> journey.
            </h1>
            
            <p className="text-xl text-slate-500 leading-relaxed max-w-xl">
              Access your personalized dashboard, track global shipments, and automate your customs compliance with our unified AI platform.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Layout, text: "AI-Powered HSN Classification" },
              { icon: ShieldCheck, text: "Automated Customs Compliance" },
              { icon: Globe, text: "End-to-End Shipment Visibility" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <item.icon size={20} />
                </div>
                <span className="text-slate-700 font-bold">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-start gap-5">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Enterprise Security</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                "Shnoor's intelligence system has completely transformed how we manage our global supply chain. A true partner in growth."
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="animate-in slide-in-from-right duration-700">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Layout size={12} /> System Access
                </div>
                <h3 className="text-4xl font-extrabold text-slate-900">Sign in to your account</h3>
                <p className="text-slate-500">Enter your credentials to access your dashboard.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Password</label>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
                    <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Remember me</span>
                  </label>
                  <button 
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {error && <p className="text-red-500 text-sm font-bold text-center mt-2">{error}</p>}
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] mt-4"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>Sign In <ArrowRight size={20} /></>
                  )}
                </button>

                <div className="pt-6 text-center">
                  <p className="text-sm text-slate-500 font-medium">
                    Don't have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => navigate('/register')}
                      className="text-amber-600 font-bold hover:text-amber-700 transition-colors"
                    >
                      Create Account
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

export default Login;
