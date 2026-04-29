import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Shield, Target, Users, Award } from 'lucide-react';
const About = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Navbar />
      <section className="max-w-7xl mx-auto px-10 py-32">
        <div className="max-w-4xl space-y-10">
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-tight">
            Redefining <span className="text-amber-500">Intelligence</span> for the Global Era.
          </h1>
          <p className="text-2xl text-slate-500 font-medium leading-relaxed">
            Shnoor International combine deep domain expertise in logistics with AI to solve the industry's most complex challenges.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 py-32 border-b border-slate-50">
          <div className="space-y-8">
            <h2 className="text-3xl font-black tracking-tight">Our Mission</h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              To empower businesses with the tools they need to navigate the complexities of international trade. By automating documentation, compliance, and risk assessment.
            </p>
          </div>
          <div className="space-y-8">
            <h2 className="text-3xl font-black tracking-tight">Our Vision</h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              We envision a world where borders are no longer barriers to commerce. Through continuous innovation in AI and machine learning.
            </p>
          </div>
        </div>
        <div className="py-32 space-y-20">
          <h2 className="text-5xl font-black tracking-tight text-center">Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { t: "Trust & Security", d: "Enterprise-grade security is at the heart of everything we build.", i: Shield },
              { t: "Precision", d: "In trade, accuracy is everything. We strive for 100% precision.", i: Target },
              { t: "Innovation", d: "We are pushing the boundaries of what AI can do for logistics.", i: Award },
              { t: "Collaboration", d: "We work closely with our partners to ensure their success.", i: Users },
            ].map((v, i) => (
              <div key={i} className="space-y-6 group">
                <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-all">
                  <v.i size={32} />
                </div>
                <h3 className="text-xl font-black tracking-tight">{v.t}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default About;