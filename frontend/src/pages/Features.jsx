import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Shield, Zap, Globe, BarChart, FileText, Search, CheckCircle2 } from 'lucide-react';

const Features = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto mb-24">
          <h1 className="text-6xl font-extrabold text-slate-900 leading-tight">
            Powerful tools for <span className="text-amber-500">global logistics</span>.
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed">
            Our modular intelligence platform provides everything you need to automate customs, classify products, and track shipments with 100% compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Document AI & OCR",
              desc: "Instant extraction of data from invoices, packing lists, and B/L with machine learning.",
              icon: FileText
            },
            {
              title: "AI HSN Classifier",
              desc: "Identify the correct 6, 8, or 10-digit HSN codes with over 99% accuracy.",
              icon: Search
            },
            {
              title: "Global Duty Engine",
              desc: "Real-time tax and duty calculations across all global corridors with FTA support.",
              icon: Globe
            },
            {
              title: "Predictive Risk Scoring",
              desc: "Detect payment delays and compliance issues before they affect your bottom line.",
              icon: Shield
            },
            {
              title: "End-to-End Tracking",
              desc: "Real-time monitoring of air, sea, and land shipments with automated alerts.",
              icon: Zap
            },
            {
              title: "Advanced Analytics",
              desc: "Visualize your trade volume, duty savings, and operational performance.",
              icon: BarChart
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-8 group-hover:scale-110 transition-transform">
                <feature.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed mb-8">{feature.desc}</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="text-emerald-500" size={16} /> Enterprise Grade
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="text-emerald-500" size={16} /> API Integration Ready
                </li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
