import React from 'react';

export const StatCard = ({ label, value, icon: Icon, color = 'amber' }) => {
  const colorMaps = {
    amber: {
      bg: 'bg-amber-50/50',
      iconBg: 'bg-amber-100 text-amber-700',
      border: 'border-amber-100',
      valueColor: 'text-amber-800'
    },
    orange: {
      bg: 'bg-orange-50/50',
      iconBg: 'bg-orange-100 text-orange-700',
      border: 'border-orange-100',
      valueColor: 'text-orange-800'
    },
    emerald: {
      bg: 'bg-emerald-50/50',
      iconBg: 'bg-emerald-100 text-emerald-700',
      border: 'border-emerald-100',
      valueColor: 'text-emerald-800'
    }
  };

  const currentTheme = colorMaps[color] || colorMaps.amber;

  return (
    <div className={`flex items-center justify-between p-2 sm:p-4 rounded-2xl border ${currentTheme.bg} ${currentTheme.border} shadow-premium transition-all duration-300 hover:scale-[1.02] gap-1.5 w-full`}>
      <div className="space-y-0.5 sm:space-y-1 text-left min-w-0 flex-1">
        <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 block truncate">{label}</span>
        <h3 className={`text-sm sm:text-2xl font-black ${currentTheme.valueColor} tracking-tight`}>{value}</h3>
      </div>
      <div className={`p-1.5 sm:p-3 rounded-xl ${currentTheme.iconBg} shrink-0`}>
        <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[2.5]" />
      </div>
    </div>
  );
};
