import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Cake, Lock, Mail, AlertCircle } from 'lucide-react';

export const Login = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password) {
      return setError('Por favor complete todos los campos.');
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifique sus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh flex items-center justify-center bg-gradient-to-br from-amber-50/50 via-white to-amber-100/30 px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-[32px] border border-amber-100/50 p-8 shadow-floating space-y-6 relative overflow-hidden">
        
        {/* Decorative ambient bubble */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-200/20 blur-2xl"></div>

        {/* Branding Headers */}
        <div className="text-center space-y-2 relative">
          <div className="inline-flex p-4 bg-amber-500 rounded-3xl text-white shadow-lg shadow-amber-500/30 transform transition-transform hover:rotate-6">
            <Cake size={32} className="stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-3">Uno con Aroma</h1>
          <p className="text-sm font-semibold text-amber-600">Sistema de Gestión de Pedidos</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {(error || authError) && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-2xl flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-rose-600 stroke-[2.5]" />
              <span>{error || authError}</span>
            </div>
          )}

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Correo Electrónico</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                placeholder="ejemplo@unoconaroma.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 focus:bg-white transition-all text-slate-700 font-medium"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Contraseña</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 focus:bg-white transition-all text-slate-700 font-medium"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-2xl shadow-floating transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
