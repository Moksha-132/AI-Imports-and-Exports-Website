import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Shield, Target, Users, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-6xl font-extrabold text-slate-900 leading-tight">
            Redefining Global <span className="text-amber-500">Intelligence</span> for the Modern Era.
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed">
            Shnoor International was founded on a simple principle: global trade should be accessible, transparent, and automated. We combine deep domain expertise in logistics with cutting-edge AI to solve the industry's most complex challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 py-24 border-b border-slate-200">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed">
              To empower businesses of all sizes with the tools they need to navigate the complexities of international trade. By automating documentation, compliance, and risk assessment, we enable our partners to focus on what they do best: growing their business.
            </p>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Our Vision</h2>
            <p className="text-slate-600 leading-relaxed">
              We envision a world where borders are no longer barriers to commerce. Through continuous innovation in AI and machine learning, Shnoor is building the digital infrastructure for a truly global economy.
            </p>
          </div>
        </div>

        <div className="py-24 space-y-16 text-center">
          <h2 className="text-4xl font-bold">The Core Values that Drive Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
            {[
              { title: "Trust & Security", desc: "Enterprise-grade security is at the heart of everything we build.", icon: Shield },
              { title: "Precision", desc: "In trade, accuracy is everything. We strive for 100% precision in every classification.", icon: Target },
              { title: "Innovation", desc: "We are constantly pushing the boundaries of what AI can do for logistics.", icon: Award },
              { title: "Collaboration", desc: "We work closely with our partners to ensure their success in the global market.", icon: Users },
            ].map((value, i) => (
              <div key={i} className="space-y-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                  <value.icon size={24} />
                </div>
                <h3 className="text-lg font-bold">{value.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{value.desc}</p>
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
