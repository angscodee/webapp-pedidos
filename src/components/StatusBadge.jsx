import React from 'react';

const STATUS_CONFIGS = {
  registrado: {
    label: 'Registrado',
    classes: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  en_sede: {
    label: 'En Sede',
    classes: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  entregado: {
    label: 'Entregado',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIGS[status] || {
    label: status,
    classes: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.classes}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current"></span>
      {config.label}
    </span>
  );
};
