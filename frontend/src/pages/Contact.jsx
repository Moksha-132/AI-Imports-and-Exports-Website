import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Platform Demo',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await apiFetch('/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setIsSent(true);
    } catch (err) {
      setError(err.message || 'Connection error. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <section className="max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div className="space-y-6">
            <h1 className="text-6xl font-extrabold text-slate-900 leading-tight">
              Let's build the <span className="text-amber-500">future</span> of trade together.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
              Have questions about our platform? Our team of experts is ready to help you optimize your global operations.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                <MapPin className="text-amber-500" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Visit Our Headquarters</h3>
                <p className="text-slate-500">10009 Mount Tabor Road, City, Odessa Missouri, United States</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                <Mail className="text-amber-500" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Email Our Team</h3>
                <p className="text-slate-500 font-bold">lmoksha.132@gmail.com</p>
                <p className="text-slate-500 text-sm">Direct Support & Inquiries</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                <Phone className="text-amber-500" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Call Us Directly</h3>
                <p className="text-slate-500">+91-9429694298</p>
                <p className="text-slate-500">+91-9041914601</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/20 relative overflow-hidden">
          {isSent ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900">Message Sent!</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Thank you for reaching out. We've received your inquiry and will get back to you shortly at <span className="font-bold text-slate-900">{formData.email}</span>.
              </p>
              <button 
                onClick={() => setIsSent(false)}
                className="text-amber-600 font-bold hover:text-amber-700 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="John Doe" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Work Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="john@company.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Subject</label>
                <select 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all appearance-none"
                >
                  <option>Platform Demo</option>
                  <option>Pricing Inquiry</option>
                  <option>Technical Support</option>
                  <option>Partnership Opportunities</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                <textarea 
                  required
                  placeholder="How can we help you?" 
                  rows={4} 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all resize-none"
                ></textarea>
              </div>
              
              {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-8 py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-amber-400/20 transition-all active:scale-95 text-lg group"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>Send Message <Send className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={20} /></>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default Contact;
