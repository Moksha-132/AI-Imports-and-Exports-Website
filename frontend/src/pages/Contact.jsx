import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
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
                <p className="text-slate-500">info@shnoor-intel.ai (General)</p>
                <p className="text-slate-500">proc@shnoor-intel.ai (Sales Support)</p>
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

        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/20">
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                <input type="text" placeholder="John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Work Email</label>
                <input type="email" placeholder="john@company.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Subject</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all appearance-none">
                <option>Select a topic</option>
                <option>Platform Demo</option>
                <option>Pricing Inquiry</option>
                <option>Technical Support</option>
                <option>Partnership Opportunities</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
              <textarea placeholder="How can we help you?" rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all resize-none"></textarea>
            </div>
            <button className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-8 py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-amber-400/20 transition-all active:scale-95 text-lg group">
              Send Message <Send className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={20} />
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
