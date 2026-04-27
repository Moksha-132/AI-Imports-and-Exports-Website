import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const scrollTo = (id) => {
    if (!isLanding) {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto bg-slate-50 sticky top-0 z-50 border-b border-slate-100/50 backdrop-blur-md">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('top')}>
        <img src="/shnoor logoo.png" alt="Shnoor Logo" className="h-12 w-auto" />
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">SHNOOR INTERNATIONAL</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Intelligence System</span>
        </div>
      </div>
      
      <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-600 uppercase tracking-widest">
        <button onClick={() => scrollTo('top')} className="hover:text-amber-500 transition-colors">Home</button>
        <button onClick={() => scrollTo('how-it-works')} className="hover:text-amber-500 transition-colors">How It Works</button>
        <button onClick={() => scrollTo('features')} className="hover:text-amber-500 transition-colors">Features</button>
        <button onClick={() => scrollTo('about')} className="hover:text-amber-500 transition-colors">About</button>
        <button onClick={() => navigate('/contact')} className={`${location.pathname === '/contact' ? 'text-amber-500' : 'hover:text-amber-500'} transition-colors`}>Contact</button>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/login')}
          className="text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors px-4 py-2"
        >
          Log In
        </button>
        <button 
          onClick={() => navigate('/register')}
          className="bg-amber-400 hover:bg-amber-50 text-slate-900 font-bold px-8 py-3 rounded-full shadow-lg shadow-amber-400/20 transition-all active:scale-95"
        >
          Get Started
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
