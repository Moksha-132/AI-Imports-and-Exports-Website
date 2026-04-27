import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Upload, Cpu, ShieldCheck, Ship } from 'lucide-react';

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto mb-24">
          <h1 className="text-6xl font-extrabold text-slate-900 leading-tight">
            Simple, automated, <span className="text-amber-500">intelligent</span>.
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed">
            Discover how Shnoor transforms messy document workflows into a streamlined, high-accuracy intelligence engine for your trade operations.
          </p>
        </div>

        <div className="space-y-32">
          {[
            {
              step: "01",
              title: "Digital Intake",
              desc: "Upload your invoices, packing lists, and certificates in any format. Our Document AI immediately extracts key data points with field-level validation.",
              icon: Upload,
              color: "bg-amber-500"
            },
            {
              step: "02",
              title: "AI Analysis",
              desc: "Our neural networks classify products to the correct HSN codes and calculate exact duties and taxes based on the latest global regulations.",
              icon: Cpu,
              color: "bg-slate-900"
            },
            {
              step: "03",
              title: "Compliance Check",
              desc: "Every transaction is screened against global sanctions, risk profiles, and local jurisdiction requirements to ensure 100% security.",
              icon: ShieldCheck,
              color: "bg-amber-500"
            },
            {
              step: "04",
              title: "Logistics Oversight",
              desc: "Monitor your shipments in real-time. Get predictive alerts on potential delays and track your trade performance through our analytics dashboard.",
              icon: Ship,
              color: "bg-slate-900"
            }
          ].map((item, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-20`}>
              <div className="flex-1 space-y-8">
                <span className="text-8xl font-black text-slate-100 block leading-none">{item.step}</span>
                <div className="space-y-4">
                  <h3 className="text-4xl font-bold">{item.title}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
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

        <div className="mt-32 bg-slate-900 rounded-[4rem] p-20 text-center space-y-10">
          <h2 className="text-5xl font-bold text-white leading-tight">Ready to automate your trade workflows?</h2>
          <button 
            onClick={() => navigate('/login')}
            className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-12 py-6 rounded-full text-xl shadow-xl shadow-amber-400/20 transition-all active:scale-95"
          >
            Get Started Now
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
