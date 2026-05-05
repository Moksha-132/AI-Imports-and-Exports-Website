import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Twitter, Linkedin, Facebook } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          {/* Section 1: Motto */}
          <div className="md:col-span-5 space-y-8">
            <div className="flex items-center gap-3">
              <img src="/shnoor logoo.png" alt="Shnoor Logo" className="h-10 w-auto" />
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white leading-none uppercase">Shnoor</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">International</span>
              </div>
            </div>
            <p className="text-lg leading-relaxed max-w-sm text-slate-400">
              Transform your trade intelligence with a platform that supports complex workflows, global compliance, and operational skill validation in one consistent experience.
            </p>
            <div className="flex gap-6 pt-4">
              <a href="#" className="text-slate-500 hover:text-amber-500 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-slate-500 hover:text-amber-500 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-slate-500 hover:text-amber-500 transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Section 2: Quick Links */}
          <div className="md:col-span-3 space-y-8">
            <h4 className="text-white font-bold text-xl">Quick Links</h4>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li><button onClick={() => navigate('/')} className="hover:text-amber-500 transition-colors">Home</button></li>
              <li><button onClick={() => scrollTo('how-it-works')} className="hover:text-amber-500 transition-colors">How It Works</button></li>
              <li><button onClick={() => scrollTo('features')} className="hover:text-amber-500 transition-colors">Features</button></li>
              <li><button onClick={() => scrollTo('about')} className="hover:text-amber-500 transition-colors">About Us</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-amber-500 transition-colors text-left">Contact Us</button></li>
            </ul>
          </div>

          {/* Section 3: Contact & Support */}
          <div className="md:col-span-4 space-y-8">
            <h4 className="text-white font-bold text-xl">Contact & Support</h4>
            <ul className="space-y-6 text-slate-400">
              <li className="flex items-start gap-3">
                <Mail className="text-amber-500 shrink-0 mt-1" size={18} />
                <div className="flex flex-col">
                  <span>info@shnoor-intel.ai (General)</span>
                  <span>proc@shnoor-intel.ai (Sales)</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="text-amber-500 shrink-0 mt-1" size={18} />
                <div className="flex flex-col">
                  <span>+91-9429694298</span>
                  <span>+91-9041914601</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="text-amber-500 shrink-0 mt-1" size={18} />
                <span>10009 Mount Tabor Road, City, Odessa Missouri, United States</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-medium">© 2026 Shnoor International. All rights reserved.</p>
          <div className="flex gap-8 text-sm font-medium">
            <button onClick={() => navigate('/privacy')} className="hover:text-amber-500 transition-colors">Privacy Policy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-amber-500 transition-colors">Terms & Conditions</button>
            <a href="/Shnoor_Company_Profile.pdf" download="Shnoor_Company_Profile.pdf" className="hover:text-amber-500 transition-colors">Company Profile</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
