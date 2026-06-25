import React, { useState } from 'react';
import { Bell, LogOut, User, Menu, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ThemeToggle from './ThemeToggle';

export default function Header({ onMenuClick }) {
  const { user, logout, notifications, markNotificationsRead } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markNotificationsRead();
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          id="sidebar-toggle-btn"
          className="p-2 -ml-2 rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <span className="hidden sm:inline text-xs font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">Sky Internship & Placements</span>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white m-0 p-0 leading-tight">Sky Portal</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {}
        <ThemeToggle />

        {}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              id="notifications-bell-btn"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors focus:outline-none"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-rose-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse-subtle">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div 
                id="notifications-dropdown"
                className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 focus:outline-none"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-medium text-primary dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors ${!notif.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                      >
                        <p className="text-xs font-semibold text-slate-800 dark:text-white">{notif.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">
                {user.profile?.name || 'User'}
              </p>
              <span className="text-[10px] font-medium tracking-wider uppercase text-slate-400 dark:text-slate-500">
                {user.role}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100 dark:bg-slate-800 text-primary dark:text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <button
                onClick={logout}
                id="logout-btn"
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
