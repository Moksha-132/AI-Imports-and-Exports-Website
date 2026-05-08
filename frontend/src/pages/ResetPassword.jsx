import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await apiFetch('/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password }),
      });
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Connection error');
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
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-20 flex justify-center">
        <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            {!isSuccess ? (
              <div className="space-y-8 relative z-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-100">
                    <ShieldCheck size={14} /> Reset Password
                  </div>
                  <h3 className="text-4xl font-extrabold text-slate-900">Set new password</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Your recovery link is valid. Please choose a strong new password for your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">New Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                      <input 
                        type="password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
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
                      <>Update Password <Zap size={20} /></>
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
                  <h3 className="text-4xl font-extrabold text-slate-900">Password Updated</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Your password has been reset successfully. You can now log in with your new credentials.
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] mt-4"
                >
                  Sign In to Continue <ArrowLeft size={16} className="rotate-180" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
