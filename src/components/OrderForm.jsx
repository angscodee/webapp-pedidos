import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, Clipboard, DollarSign, Image as ImageIcon, ShoppingBag, Weight, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { uploadReferenceImage } from '../services/orders';

const PRODUCTS = [
  'Torta de chocolate',
  'Torta de vainilla',
  'Torta personalizada',
  'Bocaditos x50',
  'Bocaditos x100'
];

const WEIGHT_OPTIONS = ['1/2 kg', '3/4 kg', '1 kg', '1 1/4 kg', 'Otro'];

const SEDES = ['SD', 'Florencia', 'Penta', 'Porvenir', 'Las Quintanas'];

export const OrderForm = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    producto: PRODUCTS[0],
    cantidad: 1,
    peso: WEIGHT_OPTIONS[2], // Default to '1 kg'
    pesoPersonalizado: '',
    fechaEntrega: '',
    observaciones: '',
    imagenReferencia: '',
    precioTotal: '',
    pagoCompleto: true,
    montoPagado: '',
    sede: user?.sede || SEDES[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  // Update default sede when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        sede: user.rol === 'admin' ? prev.sede : user.sede
      }));
    }
  }, [user]);

  // Set minimum date to today
  const getMinDateTimeString = () => {
    const now = new Date();
    // Offset local timezone
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const nextData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Auto-set montoPagado if pagoCompleto is toggled
      if (name === 'pagoCompleto') {
        if (checked) {
          nextData.montoPagado = prev.precioTotal;
        } else {
          nextData.montoPagado = '';
        }
      }
      
      // Auto-update montoPagado to match price if total paid is checked and price changes
      if (name === 'precioTotal' && prev.pagoCompleto) {
        nextData.montoPagado = value;
      }

      return nextData;
    });
  };

  const calculatedSaldo = () => {
    const total = Number(formData.precioTotal) || 0;
    const pagado = formData.pagoCompleto ? total : (Number(formData.montoPagado) || 0);
    return Math.max(0, total - pagado);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.cliente.trim()) return setError('Ingrese el nombre del cliente');
    if (!formData.telefono.trim()) return setError('Ingrese el teléfono del cliente');
    if (!/^\d{9}$/.test(formData.telefono.trim())) return setError('El teléfono debe tener 9 dígitos');
    if (formData.producto.startsWith('Torta') && formData.peso === 'Otro' && !formData.pesoPersonalizado.trim()) {
      return setError('Ingrese el peso personalizado para la torta');
    }
    if (!formData.fechaEntrega) return setError('Seleccione una fecha de entrega');
    if (!formData.precioTotal || Number(formData.precioTotal) <= 0) return setError('Ingrese un precio válido');
    if (!formData.pagoCompleto && (formData.montoPagado === '' || Number(formData.montoPagado) < 0)) {
      return setError('Ingrese el monto pagado');
    }
    if (!formData.pagoCompleto && Number(formData.montoPagado) > Number(formData.precioTotal)) {
      return setError('El monto pagado no puede ser mayor que el precio total');
    }

    setLoading(true);
    try {
      let finalImageUrl = '';
      if (imageFile) {
        finalImageUrl = await uploadReferenceImage(imageFile);
      }

      const isCake = formData.producto.startsWith('Torta');
      const finalPeso = isCake 
        ? (formData.peso === 'Otro' ? formData.pesoPersonalizado.trim() : formData.peso)
        : 'N/A';

      const orderPayload = {
        cliente: formData.cliente.trim(),
        telefono: formData.telefono.trim(),
        producto: formData.producto,
        cantidad: Number(formData.cantidad),
        peso: finalPeso,
        fechaEntrega: new Date(formData.fechaEntrega),
        observaciones: formData.observaciones.trim(),
        imagenReferencia: finalImageUrl,
        precioTotal: Number(formData.precioTotal),
        montoPagado: formData.pagoCompleto ? Number(formData.precioTotal) : Number(formData.montoPagado),
        sede: user.rol === 'admin' ? formData.sede : user.sede
      };

      await onSubmit(orderPayload);
      
      // Reset form
      setFormData({
        cliente: '',
        telefono: '',
        producto: PRODUCTS[0],
        cantidad: 1,
        peso: WEIGHT_OPTIONS[2],
        pesoPersonalizado: '',
        fechaEntrega: '',
        observaciones: '',
        imagenReferencia: '',
        precioTotal: '',
        pagoCompleto: true,
        montoPagado: '',
        sede: user?.sede || SEDES[0]
      });
      setImageFile(null);
      setImagePreview('');

      onClose();
    } catch (err) {
      setError(err.message || 'Error al registrar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      {/* Click-away backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Sliding Sheet */}
      <div className="relative bg-white rounded-t-[32px] sm:rounded-2xl max-h-[92svh] sm:max-h-[85svh] w-full sm:max-w-lg sm:mx-auto flex flex-col shadow-floating border-t sm:border border-amber-100/50 z-10 bottom-sheet-anim transition-transform overflow-hidden sm:mb-6">
        
        {/* Drag handle decoration */}
        <div className="mx-auto my-3 w-12 h-1.5 rounded-full bg-slate-200"></div>

        {/* Form Header */}
        <div className="px-6 pb-2 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-6 rounded-full bg-amber-500"></span>
            Registrar Nuevo Pedido
          </h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Container (Scrollable) */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          {/* Section 1: Customer Data */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Datos del Cliente</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cliente */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  name="cliente"
                  placeholder="Nombre completo"
                  value={formData.cliente}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700"
                />
              </div>
              {/* Teléfono */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Nro. WhatsApp (9 dígitos)"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  maxLength={9}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Product & Sede */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Detalles del Producto</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Producto */}
              <div className="relative sm:col-span-2">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <ShoppingBag size={16} />
                </span>
                <select
                  name="producto"
                  value={formData.producto}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-base bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 appearance-none text-slate-700"
                >
                  {PRODUCTS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Cantidad & Peso Selection */}
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    name="cantidad"
                    min={1}
                    value={formData.cantidad}
                    onChange={handleInputChange}
                    placeholder="Cant"
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700 text-center"
                  />
                </div>
                
                {formData.producto.startsWith('Torta') ? (
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Weight size={12} />
                    </span>
                    <select
                      name="peso"
                      value={formData.peso}
                      onChange={handleInputChange}
                      className="w-full pl-7 pr-2 py-3 rounded-xl border border-slate-200 text-base bg-white focus:outline-none focus:border-amber-500 appearance-none text-slate-700 font-medium"
                    >
                      {WEIGHT_OPTIONS.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="relative bg-slate-50 text-slate-400 text-[10px] flex items-center justify-center rounded-xl border border-slate-100 px-1 py-3 text-center leading-tight">
                    Bocaditos (N/A)
                  </div>
                )}
              </div>
            </div>

            {/* Custom Weight Input */}
            {formData.producto.startsWith('Torta') && formData.peso === 'Otro' && (
              <div className="relative animate-fadeIn">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Weight size={16} />
                </span>
                <input
                  type="text"
                  name="pesoPersonalizado"
                  placeholder="Ingrese peso personalizado (ej. 2kg, 3/4kg)"
                  value={formData.pesoPersonalizado}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700"
                />
              </div>
            )}
          </div>

          {/* Section 3: Delivery Date & Sede (Conditional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Fecha de Entrega */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fecha y Hora de Entrega</span>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Calendar size={16} />
                </span>
                <input
                  type="datetime-local"
                  name="fechaEntrega"
                  min={getMinDateTimeString()}
                  value={formData.fechaEntrega}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700"
                />
              </div>
            </div>

            {/* Sede selector (Admin-only, sellers default to their own sede) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sede del Pedido</span>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <MapPin size={16} />
                </span>
                <select
                  name="sede"
                  value={formData.sede}
                  onChange={handleInputChange}
                  disabled={user?.rol !== 'admin'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-base bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 appearance-none text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  {SEDES.map(s => (
                    <option key={s} value={s}>{user?.rol === 'admin' ? `Sede: ${s}` : `Sede: ${s} (Asignada)`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Details & Reference Image */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Detalles adicionales</span>
            
            {/* Imagen Referencia File Upload */}
            <div className="space-y-1.5">
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-amber-400 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400 group-hover:text-amber-500">
                    <ImageIcon size={28} className="mb-2 stroke-[1.5]" />
                    <p className="text-xs font-bold">Subir Imagen de Referencia</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1">PNG, JPG, JPEG (Opcional)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-100 aspect-video bg-slate-50">
                  <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Observaciones */}
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400">
                <Clipboard size={16} />
              </span>
              <textarea
                name="observaciones"
                rows={3}
                placeholder="Observaciones o dedicatoria..."
                value={formData.observaciones}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-base focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700"
              />
            </div>
          </div>

          {/* Section 5: Payment Details */}
          <div className="space-y-3 bg-amber-50/20 p-4 rounded-2xl border border-amber-100/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Estado del Pago</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* Precio Total */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  S/
                </span>
                <input
                  type="number"
                  name="precioTotal"
                  placeholder="Precio Total"
                  value={formData.precioTotal}
                  onChange={handleInputChange}
                  min={1}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700 font-bold"
                />
              </div>

              {/* Pago Completo Toggle */}
              <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <span className="text-xs font-semibold text-slate-600">¿Cancelado completo?</span>
                <input
                  type="checkbox"
                  name="pagoCompleto"
                  checked={formData.pagoCompleto}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-amber-500 rounded border-slate-300 focus:ring-amber-400"
                />
              </label>
            </div>

            {/* Custom Payment Details */}
            {!formData.pagoCompleto && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
                {/* Monto Pagado */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Monto a Cuenta</span>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      S/
                    </span>
                    <input
                      type="number"
                      name="montoPagado"
                      placeholder="Monto Pagado"
                      value={formData.montoPagado}
                      onChange={handleInputChange}
                      min={0}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-slate-700"
                    />
                  </div>
                </div>

                {/* Saldo Pendiente (Calculado) */}
                <div className="flex flex-col justify-end p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-right">
                  <span className="text-[9px] font-bold text-rose-500 uppercase">Saldo Pendiente</span>
                  <span className="text-lg font-black text-rose-600">S/ {calculatedSaldo().toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-2xl shadow-floating transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Registrar Pedido'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
