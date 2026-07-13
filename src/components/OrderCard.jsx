import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, Calendar, MapPin, ChevronDown, ChevronUp, DollarSign, Eye, Play, CheckCircle, PackageCheck } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { toDate } from '../services/orders';
import { useAuth } from '../hooks/useAuth';

export const OrderCard = ({ order, onStatusUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    id,
    cliente,
    telefono,
    producto,
    cantidad,
    observaciones,
    fechaEntrega,
    estado,
    sede,
    precioTotal = 0,
    montoPagado = 0
  } = order;

  const saldoPendiente = precioTotal - montoPagado;
  const isTotalPaid = saldoPendiente <= 0;

  const cleanPhone = telefono ? telefono.trim().replace(/\D/g, '') : '';
  const cleanPhoneFormatted = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
  const whatsappUrl = `https://wa.me/${cleanPhoneFormatted}?text=Hola%20${encodeURIComponent(cliente)},%20te%20escribimos%20de%20Uno%20con%20Aroma%20sobre%20tu%20pedido%20de%20${encodeURIComponent(producto)}.`;

  // Warning alert: if delivery scheduled before 2 PM, must be in branch by the day before.
  // If it is the delivery day (or later) and still 'registrado', show warning.
  const isLateWarning = estado === 'registrado' && (() => {
    try {
      const delivery = toDate(fechaEntrega);
      if (delivery.getHours() < 14) {
        const startOfDeliveryDay = new Date(delivery.getFullYear(), delivery.getMonth(), delivery.getDate());
        return new Date() >= startOfDeliveryDay;
      }
    } catch (e) {}
    return false;
  })();

  // Format delivery date nicely in Spanish
  const formatDelivery = (dateVal) => {
    try {
      const d = toDate(dateVal);
      return d.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const handleStatusChange = (e, nextStatus) => {
    e.stopPropagation();
    if (onStatusUpdate) {
      onStatusUpdate(id, nextStatus);
    }
  };

  const getNextStatusAction = () => {
    switch (estado) {
      case 'registrado':
        return {
          label: 'Recibido en Sede',
          status: 'en_sede',
          icon: CheckCircle,
          classes: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      case 'en_sede':
        return {
          label: 'Entregar',
          status: 'entregado',
          icon: PackageCheck,
          classes: 'bg-emerald-600 hover:bg-emerald-700 text-white'
        };
      default:
        return null;
    }
  };

  const nextAction = getNextStatusAction();
  const containerClasses = `bg-white rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer ${
    isLateWarning 
      ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/5 shadow-md shadow-rose-100/50' 
      : 'border-slate-100 shadow-premium hover:border-amber-200'
  }`;

  return (
    <div 
      onClick={() => setExpanded(!expanded)}
      className={containerClasses}
    >
      {/* Summary Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-slate-800 truncate text-sm sm:text-base">{cliente}</h4>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
              <MapPin size={8} className="mr-0.5" />
              {sede}
            </span>
            {isLateWarning && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                ⚠️ Alerta: Debió llegar ayer
              </span>
            )}
          </div>
          <p className="text-slate-600 font-semibold text-xs sm:text-sm truncate">
            {cantidad}x {producto}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Calendar size={12} className="text-amber-500" />
            <span>Entrega: {formatDelivery(fechaEntrega)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between self-stretch gap-2">
          <StatusBadge status={estado} />
          {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </div>

      {/* Expanded Actions & Metadata */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-50 pt-3 bg-amber-50/10 space-y-4 animate-fadeIn">
          {/* Details / Observations */}
          {observaciones && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Detalles / Indicaciones</span>
              <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                {observaciones}
              </p>
            </div>
          )}

          {/* Price & Payment Status */}
          <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-slate-100">
            <div className="text-center">
              <span className="block text-[9px] font-bold uppercase text-slate-400">Precio Total</span>
              <span className="text-xs font-bold text-slate-700">S/ {precioTotal.toFixed(2)}</span>
            </div>
            <div className="text-center border-x border-slate-100">
              <span className="block text-[9px] font-bold uppercase text-slate-400">Pagado</span>
              <span className={`text-xs font-bold ${isTotalPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                S/ {montoPagado.toFixed(2)}
              </span>
            </div>
            <div className="text-center">
              <span className="block text-[9px] font-bold uppercase text-slate-400">Pendiente</span>
              <span className={`text-xs font-bold ${saldoPendiente > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                S/ {saldoPendiente.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex gap-2">
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle size={14} className="stroke-[2.5]" />
              <span>WhatsApp</span>
            </a>
            <a 
              href={`tel:${telefono}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100 transition-colors"
            >
              <Phone size={14} className="stroke-[2.5]" />
              <span>Llamar</span>
            </a>
          </div>

          {/* Actions & Detail Navigation */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/order/${id}`);
              }}
              className="w-full sm:flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border border-amber-200 text-amber-700 hover:bg-amber-50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye size={14} className="stroke-[2.5]" />
              Ver Ficha
            </button>
            {nextAction && (
              <button 
                onClick={(e) => handleStatusChange(e, nextAction.status)}
                className={`w-full sm:flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${nextAction.classes}`}
              >
                <nextAction.icon size={14} className="stroke-[2.5]" />
                {nextAction.label}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
