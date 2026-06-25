import React from 'react';

export default function StatsCard({ title, value, icon: Icon, description, trend, colorClass = "text-indigo-600 dark:text-blue-400 bg-indigo-50 dark:bg-slate-800" }) {
  return (
    <div className="flex flex-col p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
        {description && (
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            {trend && (
              <span className={`font-semibold ${trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                {trend}
              </span>
            )}
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
