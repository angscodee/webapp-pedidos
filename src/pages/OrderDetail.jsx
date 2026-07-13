import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getOrderById, updateOrderStatus, toDate } from '../services/orders';
import { StatusBadge } from '../components/StatusBadge';
import { 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  User, 
  ShoppingBag, 
  Clock, 
  CheckCircle,
  PackageCheck,
  ChevronRight,
  Clipboard,
  FileText,
  Camera,
  RotateCcw
} from 'lucide-react';

export const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(id);
      setOrder(data);
    } catch (e) {
      setError(e.message || 'Error al cargar pedido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (nextStatus) => {
    if (!order || !user) return;
    try {
      setUpdating(true);
      const updatedOrder = await updateOrderStatus(order.id, nextStatus, user);
      setOrder(updatedOrder);
    } catch (e) {
      alert('Error al actualizar estado: ' + e.message);
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatuses = () => {
    if (!order) return [];
    
    // Admins can transition to any state. Vendedores transition sequentially
    if (user?.rol === 'admin') {
      return [
        { status: 'registrado', label: 'Registrado', classes: 'border-amber-200 text-amber-700 bg-amber-50' },
        { status: 'en_sede', label: 'En Sede', classes: 'border-blue-200 text-blue-700 bg-blue-50' },
        { status: 'entregado', label: 'Entregado', classes: 'border-emerald-200 text-emerald-700 bg-emerald-50' }
      ].filter(s => s.status !== order.estado);
    }

    // Sellers follow a restricted sequence
    switch (order.estado) {
      case 'registrado':
        return [{ status: 'en_sede', label: 'Recibido en Sede', classes: 'bg-blue-500 hover:bg-blue-600 text-white font-bold' }];
      case 'en_sede':
        return [{ status: 'entregado', label: 'Entregar Pedido a Cliente', classes: 'bg-emerald-500 hover:bg-emerald-600 text-white font-bold' }];
      default:
        return [];
    }
  };

  const formatDateTime = (dateVal) => {
    try {
      const d = toDate(dateVal);
      return d.toLocaleDateString('es-PE', {
        weekday: 'short',
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

  if (loading) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-slate-50/50 gap-3">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-400">Cargando detalles de pedido...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-svh p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-2xl max-w-sm">
          {error || 'El pedido solicitado no existe o no tiene permisos para verlo.'}
        </div>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
        >
          <ArrowLeft size={14} /> Volver al Inicio
        </button>
      </div>
    );
  }

  const {
    cliente,
    telefono,
    producto,
    cantidad,
    observaciones,
    fechaEntrega,
    estado,
    sede,
    precioTotal = 0,
    montoPagado = 0,
    imagenReferencia,
    creadoPorNombre,
    creadoEn,
    historial = []
  } = order;

  const saldoPendiente = precioTotal - montoPagado;
  const isPaid = saldoPendiente <= 0;
  const whatsappUrl = `https://wa.me/51${telefono}?text=Hola%20${encodeURIComponent(cliente)},%20te%20escribimos%20de%20Uno%20con%20Aroma%20sobre%20tu%20pedido%20de%20${encodeURIComponent(producto)}.`;
  const nextActions = getNextStatuses();

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

  const cardClasses = `rounded-3xl border p-5 shadow-premium space-y-4 ${
    isLateWarning 
      ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/5' 
      : 'bg-white border-slate-100'
  }`;

  return (
    <div className="min-h-svh bg-slate-50/30 pb-20">
      {/* Header Sticky Navigation */}
      <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 z-30 shadow-xs">
        <div className="max-w-lg mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={20} className="stroke-[2.5]" />
            </button>
            <h2 className="text-base font-black text-slate-800">Detalle de Pedido</h2>
          </div>
          <StatusBadge status={estado} />
        </div>
      </div>

      {/* Main Container */}
      <div className="px-5 mt-5 max-w-lg mx-auto space-y-5">
        
        {/* Main Details Card */}
        <section className={cardClasses}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-slate-800 leading-tight">{cliente}</h3>
                {isLateWarning && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                    ⚠️ Alerta: Debió llegar ayer
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-amber-600 flex items-center gap-1">
                <MapPin size={14} /> Sede {sede}
              </p>
            </div>
            
            <div className="flex gap-2">
              <a 
                href={`tel:${telefono}`}
                className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl border border-slate-100 transition-all active:scale-95"
                title="Llamar Cliente"
              >
                <Phone size={18} />
              </a>
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-2xl border border-emerald-100/50 transition-all active:scale-95"
                title="WhatsApp Cliente"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          <hr className="border-slate-50" />

          {/* Product Block */}
          <div className="flex gap-3 bg-amber-50/10 p-3 rounded-2xl border border-amber-100/30">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center">
              <ShoppingBag size={20} className="stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Detalle del Producto</span>
              <p className="text-sm font-black text-slate-700 truncate">{cantidad}x {producto}</p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Peso/Porción: {order.peso || '1kg'}</p>
            </div>
          </div>

          {/* Delivery Date Block */}
          <div className="flex gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Fecha Programada de Entrega</span>
              <p className="text-sm font-bold text-slate-700 mt-0.5">{formatDateTime(fechaEntrega)}</p>
            </div>
          </div>

          {/* Observations */}
          {observaciones && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Indicaciones Especiales</span>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-600 text-xs leading-relaxed font-medium">
                {observaciones}
              </div>
            </div>
          )}

          {/* Reference Image */}
          {imagenReferencia && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1 flex items-center gap-1">
                <Camera size={12} /> Imagen de Referencia
              </span>
              <div className="rounded-2xl overflow-hidden border border-slate-100 aspect-video relative group">
                <img 
                  src={imagenReferencia} 
                  alt="Referencia del pedido" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Pricing / Payment Status Card */}
        <section className="bg-white rounded-3xl border border-slate-100 p-5 shadow-premium space-y-3.5">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Resumen del Pago</h4>
          
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
            <div className="p-2 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl text-center border border-slate-100">
              <span className="block text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">Precio Total</span>
              <span className="text-xs sm:text-sm font-black text-slate-700">S/ {precioTotal.toFixed(2)}</span>
            </div>
            <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl text-center border ${isPaid ? 'bg-emerald-50/50 border-emerald-100' : 'bg-amber-50/50 border-amber-100'}`}>
              <span className="block text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">A Cuenta</span>
              <span className={`text-xs sm:text-sm font-black ${isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                S/ {montoPagado.toFixed(2)}
              </span>
            </div>
            <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl text-center border ${saldoPendiente > 0 ? 'bg-rose-50/50 border-rose-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
              <span className="block text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">Saldo</span>
              <span className={`text-xs sm:text-sm font-black ${saldoPendiente > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                S/ {saldoPendiente.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-500">
            <span>Creado por: {creadoPorNombre}</span>
            <span>{formatDateTime(creadoEn)}</span>
          </div>
        </section>

        {/* Actions Transition Panel */}
        {nextActions.length > 0 && (
          <section className="bg-white rounded-3xl border border-slate-100 p-5 shadow-premium space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Actualizar Estado</h4>
            
            {user?.rol === 'admin' ? (
              <div className="flex flex-col md:grid md:grid-cols-2 gap-2">
                {nextActions.map(action => (
                  <button
                    key={action.status}
                    onClick={() => handleStatusChange(action.status)}
                    disabled={updating}
                    className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all active:scale-98 ${action.classes}`}
                  >
                    Marcar como "{action.label}"
                  </button>
                ))}
              </div>
            ) : (
              nextActions.map(action => (
                <button
                  key={action.status}
                  onClick={() => handleStatusChange(action.status)}
                  disabled={updating}
                  className={`w-full py-4 rounded-2xl text-xs font-black shadow-lg shadow-amber-500/10 transition-all active:scale-98 ${action.classes}`}
                >
                  {action.label}
                </button>
              ))
            )}
          </section>
        )}

        {/* Timeline (Trazabilidad) */}
        <section className="bg-white rounded-3xl border border-slate-100 p-5 shadow-premium space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Línea de Tiempo (Trazabilidad)</h4>
          
          <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6">
            {historial.map((hist, index) => {
              const histDate = toDate(hist.fecha);
              return (
                <div key={index} className="relative">
                  {/* Circle indicator */}
                  {/* Circle indicator */}
                  <span className={`absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                    hist.estado === 'entregado' ? 'bg-emerald-500' :
                    hist.estado === 'en_sede' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}>
                  </span>
                  
                  {/* Text node */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800">
                        Estado: {hist.estado === 'registrado' ? 'Pedido Registrado' :
                                 hist.estado === 'en_sede' ? 'Recibido en Sede' : 'Entregado a Cliente'}
                      </span>
                      <StatusBadge status={hist.estado} />
                    </div>
                    <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <span>Por: {hist.modificadoPorNombre || 'Usuario'}</span>
                      <span>•</span>
                      <span>{formatDateTime(histDate)}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
