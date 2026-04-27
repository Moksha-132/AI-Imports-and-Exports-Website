import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Bell, Search, User } from 'lucide-react';
import DashboardHome from './pages/DashboardHome';
import DocumentIntelligence from './pages/DocumentIntelligence';
import HSNSearch from './pages/HSNSearch';
import DutyCalculator from './pages/DutyCalculator';
import RiskAnalysis from './pages/RiskAnalysis';
import ShipmentTracking from './pages/ShipmentTracking';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import HowItWorks from './pages/HowItWorks';
import Features from './pages/Features';
import About from './pages/About';
import Contact from './pages/Contact';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'dashboard';

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-600">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => navigate(`/dashboard/${tab}`)} 
        onLogout={() => navigate('/')} 
      />
      
      <main className="flex-1 ml-72 p-10 overflow-y-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-slate-500 font-medium mt-1">Welcome back, Moksha. Here's your trade overview.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search shipments..." 
                className="bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 w-72 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-sm"
              />
            </div>
            <button className="relative p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-amber-500 transition-colors shadow-sm">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">Moksha</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Administrator</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center overflow-hidden">
                <User size={24} className="text-amber-600" />
              </div>
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="documents" element={<DocumentIntelligence />} />
            <Route path="hsn" element={<HSNSearch />} />
            <Route path="duty" element={<DutyCalculator />} />
            <Route path="risk" element={<RiskAnalysis />} />
            <Route path="shipment" element={<ShipmentTracking />} />
            <Route path="analytics" element={<Analytics />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard/*" element={<DashboardLayout />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
