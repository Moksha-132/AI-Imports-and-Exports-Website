import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await apiFetch('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setIsSent(true);
    } catch (err) {
      setError(err.message || 'Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-amber-100 overflow-x-hidden">
      <nav className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/shnoor logoo.png" alt="Shnoor Logo" className="h-10 w-auto" />
          <div className="hidden sm:block">
            <h2 className="text-lg font-bold text-slate-900 leading-tight">SHNOOR INTERNATIONAL</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Trade Intelligence System</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:border-amber-500 hover:text-amber-500 transition-all shadow-sm"
        >
          <ArrowLeft size={16} /> Back to Login
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-20 flex justify-center">
        <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            {!isSent ? (
              <div className="space-y-8 relative z-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-100">
                    <ShieldCheck size={14} /> Security
                  </div>
                  <h3 className="text-4xl font-extrabold text-slate-900">Forgot Password?</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Enter the email address associated with your account and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2 text-left">
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

                  {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] mt-4"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>Send Recovery Link <Zap size={20} /></>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-8 relative z-10 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-extrabold text-slate-900">Check your email</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    We've sent a password recovery link to <span className="font-bold text-slate-900">{email}</span>. Please check your inbox.
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 text-amber-600 font-bold hover:text-amber-700 transition-colors"
                >
                  <ArrowLeft size={16} /> Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
export default ForgotPassword;