import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { 
  ArrowLeft, 
  TrendingUp, 
  UserPlus, 
  MapPin, 
  Briefcase, 
  Cake, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  Plus, 
  Mail, 
  Lock, 
  Loader2 
} from 'lucide-react';

const SEDES = ['SD', 'Florencia', 'Penta', 'Porvenir', 'Las Quintanas'];
const ROLES = ['vendedor', 'admin'];

export const AdminPanel = () => {
  const { user, registerUser } = useAuth();
  const { orders, loading: ordersLoading } = useOrders('TODAS');
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' or 'users'

  // Register user states
  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    usuario: '',
    sede: SEDES[0],
    rol: ROLES[0]
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  // Protect route client-side just in case
  useEffect(() => {
    if (user && user.rol !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const { email, password, usuario, sede, rol } = userFormData;

    // Validate
    if (!usuario.trim()) return setRegError('Ingrese el nombre del usuario.');
    if (!email.trim()) return setRegError('Ingrese el correo electrónico.');
    if (!password || password.length < 6) return setRegError('La contraseña debe tener al menos 6 caracteres.');

    setRegLoading(true);
    try {
      await registerUser(email.trim(), password, usuario.trim(), sede, rol);
      setRegSuccess(`Usuario "${usuario}" creado con éxito en la sede "${sede}".`);
      // Reset form
      setUserFormData({
        email: '',
        password: '',
        usuario: '',
        sede: SEDES[0],
        rol: ROLES[0]
      });
    } catch (err) {
      setRegError(err.message || 'Error al registrar el usuario.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Compute metrics:
  // 1. Orders per Sede
  // 2. Best selling products
  const calculateAnalytics = () => {
    const sedeCounts = SEDES.reduce((acc, curr) => {
      acc[curr] = 0;
      return acc;
    }, {});

    const productCounts = {};

    orders.forEach(o => {
      // Sede counts
      if (sedeCounts[o.sede] !== undefined) {
        sedeCounts[o.sede]++;
      } else {
        sedeCounts[o.sede] = 1;
      }

      // Product counts
      if (o.producto) {
        productCounts[o.producto] = (productCounts[o.producto] || 0) + (o.cantidad || 1);
      }
    });

    // Format products for rendering sorted
    const sortedProducts = Object.keys(productCounts)
      .map(name => ({ name, count: productCounts[name] }))
      .sort((a, b) => b.count - a.count);

    return {
      sedeCounts: Object.entries(sedeCounts).map(([sede, count]) => ({ sede, count })),
      products: sortedProducts
    };
  };

  const analytics = calculateAnalytics();
  const totalOrders = orders.length;

  return (
    <div className="min-h-svh bg-slate-50/20 pb-20">
      {/* Header Sticky */}
      <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 z-30 shadow-xs">
        <div className="max-w-lg mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={20} className="stroke-[2.5]" />
            </button>
            <h2 className="text-base font-black text-slate-800">Panel de Administración</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 uppercase">
            Consolidados
          </span>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="bg-white border-b border-slate-100 px-5 z-20 sticky top-[53px]">
        <div className="max-w-lg mx-auto w-full flex gap-5">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'metrics'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <TrendingUp size={16} />
            Métricas
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserPlus size={16} />
            Crear Usuarios
          </button>
        </div>
      </div>

      {/* Page Content Container */}
      <div className="px-5 mt-5 max-w-lg mx-auto">
        
        {/* Tab 1: METRICS */}
        {activeTab === 'metrics' && (
          <div className="space-y-5">
            {ordersLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 bg-white rounded-3xl border border-slate-100">
                <Loader2 className="animate-spin text-amber-500" size={24} />
                <span className="text-xs font-bold text-slate-400">Procesando reportes...</span>
              </div>
            ) : (
              <>
                {/* Orders by Sede Chart */}
                <section className="bg-white rounded-3xl border border-slate-100 p-5 shadow-premium space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-4 rounded bg-amber-500"></span>
                    Pedidos por Sede (Total: {totalOrders})
                  </h3>
                  
                  <div className="space-y-3.5">
                    {analytics.sedeCounts.map(({ sede, count }) => {
                      const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
                      return (
                        <div key={sede} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-600 flex items-center gap-1">
                              <MapPin size={12} className="text-amber-500" />
                              Sede {sede}
                            </span>
                            <span className="text-slate-700">{count} pedidos ({percentage.toFixed(0)}%)</span>
                          </div>
                          {/* Progress bar container */}
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-amber-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Best Selling Products Chart */}
                <section className="bg-white rounded-3xl border border-slate-100 p-5 shadow-premium space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-4 rounded bg-orange-500"></span>
                    Productos Más Vendidos
                  </h3>

                  {analytics.products.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No hay datos de productos registrados.</p>
                  ) : (
                    <div className="space-y-3.5">
                      {analytics.products.map(({ name, count }) => {
                        // Max count helper to compute percentage relative to best seller
                        const maxCount = analytics.products[0]?.count || 1;
                        const percentage = (count / maxCount) * 100;
                        return (
                          <div key={name} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-slate-600 flex items-center gap-1.5">
                                <Cake size={12} className="text-orange-500" />
                                {name}
                              </span>
                              <span className="text-slate-700">{count} unidades</span>
                            </div>
                            {/* Bar */}
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-orange-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        )}

        {/* Tab 2: CREATE USERS */}
        {activeTab === 'users' && (
          <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-premium space-y-5">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Users size={18} className="text-amber-500" />
                Registrar Nuevo Personal
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Cree perfiles para vendedores o administradores. El personal podrá iniciar sesión con estas credenciales.
              </p>
            </div>

            <hr className="border-slate-50" />

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {regError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-2xl flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 text-rose-600 stroke-[2.5]" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-2xl flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {/* Name field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Nombre Completo</label>
                <div className="relative">
                  <input
                    type="text"
                    name="usuario"
                    placeholder="Ej. Juan Pérez"
                    value={userFormData.usuario}
                    onChange={handleUserInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700"
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Correo Electrónico</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="correo@unoconaroma.com"
                    value={userFormData.email}
                    onChange={handleUserInputChange}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Contraseña de Acceso</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    name="password"
                    placeholder="Mínimo 6 caracteres"
                    value={userFormData.password}
                    onChange={handleUserInputChange}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Scope selectors (Sede and Rol) */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Sede */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Asignar Sede</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <MapPin size={14} />
                    </span>
                    <select
                      name="sede"
                      value={userFormData.sede}
                      onChange={handleUserInputChange}
                      className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 text-base bg-white focus:outline-none focus:border-amber-500 appearance-none text-slate-700 font-bold"
                    >
                      {SEDES.map(s => (
                        <option key={s} value={s}>Sede {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Rol */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Asignar Rol</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Briefcase size={14} />
                    </span>
                    <select
                      name="rol"
                      value={userFormData.rol}
                      onChange={handleUserInputChange}
                      className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 text-base bg-white focus:outline-none focus:border-amber-500 appearance-none text-slate-700 font-bold"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>Rol: {r === 'admin' ? 'Admin' : 'Vendedor'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-2xl shadow-floating transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {regLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  'Registrar Nuevo Personal'
                )}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
};
