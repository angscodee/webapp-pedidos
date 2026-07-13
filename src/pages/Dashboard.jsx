import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { StatCard } from '../components/StatCard';
import { OrderCard } from '../components/OrderCard';
import { OrderForm } from '../components/OrderForm';
import { toDate } from '../services/orders';
import { 
  LogOut, 
  Plus, 
  MapPin, 
  Filter, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  User, 
  Search, 
  Calendar,
  Settings,
  ChevronRight
} from 'lucide-react';

const SEDES = ['SD', 'Florencia', 'Penta', 'Porvenir', 'Las Quintanas'];

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Scope branch selector for admins. Default is "TODAS"
  const [selectedSede, setSelectedSede] = useState('TODAS');
  const { orders, loading, addOrder, updateStatus } = useOrders(selectedSede);

  const [activeStatusFilter, setActiveStatusFilter] = useState('ALL'); // 'ALL', 'registrado', 'en_sede', 'entregado'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD in local time
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);

  // Compute metrics based on retrieved orders
  // 1. Total Hoy: Orders delivering today
  // 2. Pendientes: status in ['pendiente', 'en_proceso']
  // 3. Entregados: status === 'entregado'
  const getMetrics = () => {
    const todayStr = new Date().toDateString();
    
    let totalHoy = 0;
    let pendientes = 0;
    let entregados = 0;

    orders.forEach(o => {
      const deliveryDate = toDate(o.fechaEntrega);
      if (deliveryDate.toDateString() === todayStr) {
        totalHoy++;
      }
      if (o.estado === 'registrado') {
        pendientes++;
      }
      if (o.estado === 'entregado') {
        entregados++;
      }
    });

    return { totalHoy, pendientes, entregados };
  };

  const metrics = getMetrics();

  // Filter orders client-side for searching, status clicks, and dates
  const filteredOrders = orders.filter(o => {
    // 1. Status Filter
    if (activeStatusFilter !== 'ALL' && o.estado !== activeStatusFilter) {
      return false;
    }

    // 2. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchClient = o.cliente?.toLowerCase().includes(query);
      const matchProduct = o.producto?.toLowerCase().includes(query);
      if (!matchClient && !matchProduct) return false;
    }

    // 3. Date Filter (If set)
    if (selectedDate) {
      const deliveryDate = toDate(o.fechaEntrega);
      // Format YYYY-MM-DD in browser's local timezone to avoid UTC shifting
      const year = deliveryDate.getFullYear();
      const month = String(deliveryDate.getMonth() + 1).padStart(2, '0');
      const day = String(deliveryDate.getDate()).padStart(2, '0');
      const deliveryDateStr = `${year}-${month}-${day}`;
      
      if (deliveryDateStr !== selectedDate) return false;
    }

    return true;
  });

  const handleCreateOrderSubmit = async (orderPayload) => {
    await addOrder(orderPayload);
  };

  const handleStatusUpdate = async (orderId, nextStatus) => {
    try {
      await updateStatus(orderId, nextStatus);
    } catch (e) {
      alert('Error al actualizar estado: ' + e.message);
    }
  };

  return (
    <div className="min-h-svh pb-24 bg-amber-50/10 flex flex-col">
      {/* Header Container */}
      <header className="glass-header text-white px-6 pt-5 pb-5 shadow-md">
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
                <ShoppingBag size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-lg font-black tracking-tight">Uno con Aroma</h2>
                  <span className="inline-flex px-1.5 py-0.5 text-[9px] font-black rounded-md bg-white/25 uppercase">
                    {user?.rol}
                  </span>
                </div>
                <p className="text-[11px] text-white/80 font-medium flex items-center gap-1">
                  <MapPin size={10} className="fill-white/10" />
                  Sede: {user?.rol === 'admin' ? 'Ver Todas' : user?.sede}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {user?.rol === 'admin' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="p-2.5 bg-white/15 hover:bg-white/25 rounded-xl transition-all"
                  title="Panel de Administración"
                >
                  <Settings size={18} className="stroke-[2.5]" />
                </button>
              )}
              <button 
                onClick={logout}
                className="p-2.5 bg-white/15 hover:bg-white/25 rounded-xl transition-all text-amber-100 hover:text-white"
                title="Cerrar Sesión"
              >
                <LogOut size={18} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Admin Sede Selector Row */}
          {user?.rol === 'admin' && (
            <div className="mt-4 flex items-center justify-between gap-3 bg-white/10 p-2.5 rounded-2xl border border-white/15">
              <span className="text-xs font-bold text-white/95 flex items-center gap-1">
                <MapPin size={12} />
                Filtrar Sede:
              </span>
              <select
                value={selectedSede}
                onChange={(e) => setSelectedSede(e.target.value)}
                className="bg-slate-900/40 text-white font-bold text-xs py-1.5 px-3 rounded-xl border border-white/20 focus:outline-none focus:ring-1 focus:ring-amber-300"
              >
                <option value="TODAS" className="bg-slate-800 text-white">Todas las Sedes</option>
                {SEDES.map(s => (
                  <option key={s} value={s} className="bg-slate-800 text-white">Sede {s}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>



      {/* Main Content Area */}
      <main className="px-5 mt-6 pb-6 space-y-5 flex-1 max-w-2xl mx-auto w-full">
        {/* Metrics Grid */}
        <section className="grid grid-cols-3 gap-2.5">
          <StatCard 
            label="Total Hoy" 
            value={metrics.totalHoy} 
            icon={ShoppingBag} 
            color="amber"
          />
          <StatCard 
            label="Pendientes" 
            value={metrics.pendientes} 
            icon={Clock} 
            color="orange"
          />
          <StatCard 
            label="Entregados" 
            value={metrics.entregados} 
            icon={CheckCircle2} 
            color="emerald"
          />
        </section>

        {/* Search & Date Controls */}
        <section className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-premium space-y-2.5">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Buscar cliente o producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:bg-amber-50/5 text-slate-700 font-medium"
            />
          </div>
          {/* Date Picker Row */}
          <div className="flex flex-col gap-2">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Calendar size={14} />
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:bg-amber-50/5 text-slate-700 font-bold appearance-none"
              />
            </div>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-100 transition-all text-center cursor-pointer"
              >
                Ver todos los días
              </button>
            )}
          </div>
        </section>

        {/* Tab Filters Bar */}
        <section className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar -mx-5 px-5">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'registrado', label: 'Registrados' },
            { id: 'en_sede', label: 'En Sede' },
            { id: 'entregado', label: 'Entregados' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveStatusFilter(tab.id)}
              className={`shrink-0 py-2 px-4 rounded-full text-xs font-bold border transition-all duration-150 active:scale-95 ${
                activeStatusFilter === tab.id
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/10'
                  : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200 shadow-sm'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {/* Orders List Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
              {selectedDate ? 'Pedidos del día' : 'Todos los pedidos'} ({filteredOrders.length})
            </h3>
            {user?.rol === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="text-xs font-bold text-amber-600 flex items-center hover:text-amber-700 transition-colors"
              >
                Panel Consolidados <ChevronRight size={14} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-slate-400">Sincronizando base de datos...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-premium space-y-3">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
                <ShoppingBag size={28} className="stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-700 text-sm">No se encontraron pedidos</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-[240px] mx-auto">
                  No hay registros que coincidan con los filtros activos. Registre uno nuevo o modifique las fechas.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredOrders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-full flex items-center justify-center shadow-floating transform active:scale-95 transition-all z-40 hover:rotate-90 duration-300"
        title="Crear Nuevo Pedido"
      >
        <Plus size={28} className="stroke-[2.5]" />
      </button>

      {/* Bottom Sheet New Order Form */}
      <OrderForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleCreateOrderSubmit}
      />
    </div>
  );
};
