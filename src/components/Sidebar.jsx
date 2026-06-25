import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  UserSquare2, 
  PlusCircle, 
  Building2, 
  Users, 
  History, 
  X,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar({ isOpen, onClose, activeTab, setActiveTab }) {
  const { user } = useApp();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onClose) onClose();
  };

  const menuItems = {
    student: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'jobs', label: 'Opportunities', icon: Briefcase },
      { id: 'profile', label: 'My Profile', icon: UserSquare2 },
    ],
    recruiter: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'post_job', label: 'Post a Job', icon: PlusCircle },
      { id: 'my_jobs', label: 'Job Postings', icon: Briefcase },
    ],
    admin: [
      { id: 'dashboard', label: 'Dashboard / Stats', icon: LayoutDashboard },
      { id: 'companies', label: 'Companies', icon: Building2 },
      { id: 'students', label: 'Students List', icon: Users },
      { id: 'activity_logs', label: 'Audit Logs', icon: History },
    ]
  };

  const activeMenuItems = user ? menuItems[user.role] || [] : [];

  return (
    <>
      {}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-400 border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white">
            <GraduationCap className="w-8 h-8 text-indigo-400" />
            <span className="text-lg font-bold tracking-tight">Sky Portal</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg lg:hidden hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {}
        {user && (
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40">
            <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Logged in as</p>
            <p className="text-sm font-bold text-white mt-1 truncate">{user.profile?.name || 'Administrator'}</p>
            <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wide">
              {user.role}
            </span>
          </div>
        )}

        {}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {activeMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {}
        <div className="p-4 border-t border-slate-800 text-center text-[10px] text-slate-500">
          © {new Date().getFullYear()} Sky Placement Cell. <br />
          All rights reserved.
        </div>
      </aside>
    </>
  );
}
