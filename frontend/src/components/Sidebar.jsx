import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Search, Calculator, ShieldCheck, Truck, BarChart3, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { id: 'documents', icon: FileText, label: 'Documents', path: '/dashboard/documents' },
    { id: 'hsn', icon: Search, label: 'HSN Search', path: '/dashboard/hsn' },
    { id: 'duty', icon: Calculator, label: 'Duty Calc', path: '/dashboard/duty' },
    { id: 'risk', icon: ShieldCheck, label: 'Risk Analysis', path: '/dashboard/risk' },
    { id: 'shipment', icon: Truck, label: 'Tracking', path: '/dashboard/shipment' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
  ];

  return (
    <div className="w-72 h-screen flex flex-col bg-white border-r border-slate-100 p-8 fixed left-0 top-0 shadow-sm">
      <div className="flex items-center gap-3 mb-12 px-2 cursor-pointer" onClick={() => navigate('/')}>
        <img src="/shnoor logoo.png" alt="Shnoor Logo" className="h-10 w-auto" />
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight text-slate-900 leading-none">SHNOOR</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">International</span>
        </div>
      </div>

      <nav className="flex-1 space-y-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.id === 'dashboard'}
            className={({ isActive }) => 
              `nav-link w-full group ${isActive ? 'nav-link-active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-900 transition-colors'} />
                <span className="font-bold">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-100 space-y-3">
        <button className="nav-link w-full group">
          <Settings size={20} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
          <span className="font-bold">Settings</span>
        </button>
        <button 
          onClick={onLogout}
          className="nav-link w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50"
        >
          <LogOut size={20} />
          <span className="font-bold">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
