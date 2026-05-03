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
import Ledger from './pages/Ledger';
import HowItWorks from './pages/HowItWorks';
import Features from './pages/Features';
import About from './pages/About';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'dashboard';

  const fullName = localStorage.getItem('full_name') || 'Moksha';

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-600">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => navigate(`/dashboard/${tab}`)} 
        onLogout={() => { localStorage.clear(); navigate('/'); }} 
      />
      
      <main className="flex-1 ml-72 p-10 overflow-y-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-slate-500 font-medium mt-1">Welcome back, {fullName.split(' ')[0]}. Here's your trade overview.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{fullName}</p>
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
            <Route path="ledger" element={<Ledger />} />
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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