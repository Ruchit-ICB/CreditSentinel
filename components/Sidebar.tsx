import React from 'react';
import { Home, List, PieChart, ShieldAlert, Globe, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'loans', label: 'Loan Portfolio', icon: List },
    { id: 'reports', label: 'Risk Reports', icon: PieChart },
    { id: 'alerts', label: 'Alerts', icon: ShieldAlert },
    { id: 'market', label: 'Market Intel', icon: Globe }, // New Link
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 border-r border-slate-800 sidebar-container z-20">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg">CS</div>
          <span className="font-semibold text-xl tracking-tight">CreditSentinel</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 uppercase tracking-wider">LMA Edge Edition</div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* IAM User Profile Section */}
      <div className="p-4 bg-slate-800/50">
        <div className="flex items-center gap-3 mb-4 px-2">
            {user?.avatar ? (
                <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-600" />
            ) : (
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                    <UserIcon size={14} />
                </div>
            )}
            <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Guest'}</p>
                <p className="text-xs text-blue-400 truncate">{user?.role || 'Viewer'}</p>
            </div>
        </div>

        <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs transition-colors">
          <Settings size={14} />
          Settings
        </button>
        <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-900/20 rounded-lg text-xs transition-colors mt-1"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </div>
  );
};