import { supabase, hasSupabaseCredentials } from './supabase';

// ─── Mock fallback data ───────────────────────────────────────────────────────
const DEFAULT_MOCK_ORDERS = [
  {
    id: 'ord-101',
    cliente: 'Juan Perez',
    telefono: '987654321',
    producto: 'Torta chocolate 1kg',
    cantidad: 1,
    observaciones: 'Escribir "Feliz Cumpleaños Papá" con crema blanca.',
    fechaEntrega: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    estado: 'entregado',
    sede: 'Florencia',
    precioTotal: 65,
    montoPagado: 30,
    imagenReferencia: '',
    creadoPor: 'vendedor-florencia-uid',
    creadoPorNombre: 'Vendedor Florencia',
    creadoEn: new Date(Date.now() - 3600000 * 4).toISOString(),
    actualizadoEn: new Date(Date.now() - 3600000 * 1).toISOString(),
    historial: [
      { estado: 'registrado', fecha: new Date(Date.now() - 3600000 * 4).toISOString(), modificadoPor: 'vendedor-florencia-uid', modificadoPorNombre: 'Vendedor Florencia' },
      { estado: 'en_sede',    fecha: new Date(Date.now() - 3600000 * 2).toISOString(), modificadoPor: 'vendedor-florencia-uid', modificadoPorNombre: 'Vendedor Florencia' },
      { estado: 'entregado',  fecha: new Date(Date.now() - 3600000 * 1).toISOString(), modificadoPor: 'vendedor-florencia-uid', modificadoPorNombre: 'Vendedor Florencia' }
    ]
  },
  {
    id: 'ord-102',
    cliente: 'Ana Gómez',
    telefono: '951753456',
    producto: 'Bocaditos x50',
    cantidad: 2,
    observaciones: '25 empanaditas y 25 alfajores.',
    fechaEntrega: new Date(new Date().setHours(17, 30, 0, 0)).toISOString(),
    estado: 'registrado',
    sede: 'Florencia',
    precioTotal: 80,
    montoPagado: 80,
    imagenReferencia: '',
    creadoPor: 'vendedor-florencia-uid',
    creadoPorNombre: 'Vendedor Florencia',
    creadoEn: new Date(Date.now() - 3600000 * 6).toISOString(),
    actualizadoEn: new Date(Date.now() - 3600000 * 6).toISOString(),
    historial: [
      { estado: 'registrado', fecha: new Date(Date.now() - 3600000 * 6).toISOString(), modificadoPor: 'vendedor-florencia-uid', modificadoPorNombre: 'Vendedor Florencia' }
    ]
  },
  {
    id: 'ord-103',
    cliente: 'Carlos Ruiz',
    telefono: '963258741',
    producto: 'Torta personalizada',
    cantidad: 1,
    observaciones: 'Diseño de Spiderman, bizcocho de vainilla con manjar blanco.',
    fechaEntrega: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    estado: 'registrado',
    sede: 'Penta',
    precioTotal: 120,
    montoPagado: 50,
    imagenReferencia: '',
    creadoPor: 'vendedor-penta-uid',
    creadoPorNombre: 'Vendedor Penta',
    creadoEn: new Date(Date.now() - 3600000 * 2).toISOString(),
    actualizadoEn: new Date(Date.now() - 3600000 * 2).toISOString(),
    historial: [
      { estado: 'registrado', fecha: new Date(Date.now() - 3600000 * 2).toISOString(), modificadoPor: 'vendedor-penta-uid', modificadoPorNombre: 'Vendedor Penta' }
    ]
  }
];

const getMockOrders = () => {
  const orders = localStorage.getItem('pedidosuca_orders');
  if (!orders) {
    localStorage.setItem('pedidosuca_orders', JSON.stringify(DEFAULT_MOCK_ORDERS));
    return DEFAULT_MOCK_ORDERS;
  }
  return JSON.parse(orders);
};

const saveMockOrders = (orders) => {
  localStorage.setItem('pedidosuca_orders', JSON.stringify(orders));
  notifyMockListeners();
};

let mockListeners = [];
const notifyMockListeners = () => {
  const orders = getMockOrders();
  mockListeners.forEach(l => l.callback(filterAndSort(orders, l.filters)));
};

const filterAndSort = (orders, filters) => {
  let result = [...orders];
  if (filters.sede && filters.sede !== 'TODAS') {
    result = result.filter(o => o.sede === filters.sede);
  }
  return result.sort((a, b) => new Date(a.fechaEntrega) - new Date(b.fechaEntrega));
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const toDate = (value) => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  if (typeof value.toDate === 'function') return value.toDate();
  if (value.seconds !== undefined) return new Date(value.seconds * 1000);
  return new Date(value);
};

// Map Supabase snake_case row → camelCase app object
const rowToOrder = (row) => ({
  id: row.id,
  cliente: row.cliente,
  telefono: row.telefono,
  producto: row.producto,
  cantidad: row.cantidad,
  observaciones: row.observaciones,
  fechaEntrega: row.fecha_entrega,
  estado: row.estado,
  sede: row.sede,
  precioTotal: row.precio_total,
  montoPagado: row.monto_pagado,
  imagenReferencia: row.imagen_referencia,
  creadoPor: row.creado_por,
  creadoPorNombre: row.creado_por_nombre,
  creadoEn: row.creado_en,
  actualizadoEn: row.actualizado_en,
  historial: row.historial || []
});

// ─── Create Order ─────────────────────────────────────────────────────────────
export const createOrder = async (orderData, currentUser) => {
  const {
    cliente, telefono, producto, cantidad, observaciones,
    fechaEntrega, sede, precioTotal, montoPagado, imagenReferencia
  } = orderData;

  const historialInicial = [{
    estado: 'registrado',
    fecha: new Date().toISOString(),
    modificadoPor: currentUser.uid,
    modificadoPorNombre: currentUser.usuario || 'Usuario UCA'
  }];

  if (!hasSupabaseCredentials) {
    const orders = getMockOrders();
    const newOrder = {
      id: 'ord-' + Math.random().toString(36).substr(2, 9),
      cliente, telefono, producto,
      cantidad: Number(cantidad),
      observaciones: observaciones || '',
      fechaEntrega: fechaEntrega instanceof Date ? fechaEntrega.toISOString() : fechaEntrega,
      estado: 'registrado',
      sede,
      precioTotal: Number(precioTotal) || 0,
      montoPagado: Number(montoPagado) || 0,
      imagenReferencia: imagenReferencia || '',
      creadoPor: currentUser.uid,
      creadoPorNombre: currentUser.usuario || 'Usuario UCA',
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
      historial: historialInicial
    };
    orders.unshift(newOrder);
    saveMockOrders(orders);
    return newOrder;
  }

  const { data, error } = await supabase
    .from('pedidos')
    .insert([{
      cliente, telefono, producto,
      cantidad: Number(cantidad),
      observaciones: observaciones || '',
      fecha_entrega: fechaEntrega instanceof Date ? fechaEntrega.toISOString() : fechaEntrega,
      estado: 'registrado',
      sede,
      precio_total: Number(precioTotal) || 0,
      monto_pagado: Number(montoPagado) || 0,
      imagen_referencia: imagenReferencia || '',
      creado_por: currentUser.uid,
      creado_por_nombre: currentUser.usuario || 'Usuario UCA',
      historial: historialInicial
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToOrder(data);
};

// ─── Update Order Status ──────────────────────────────────────────────────────
export const updateOrderStatus = async (orderId, newStatus, currentUser) => {
  if (!hasSupabaseCredentials) {
    const orders = getMockOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('Pedido no encontrado');
    const order = orders[index];
    const newNode = {
      estado: newStatus,
      fecha: new Date().toISOString(),
      modificadoPor: currentUser.uid,
      modificadoPorNombre: currentUser.usuario
    };
    const updated = {
      ...order,
      estado: newStatus,
      actualizadoEn: new Date().toISOString(),
      historial: [...(order.historial || []), newNode]
    };
    orders[index] = updated;
    saveMockOrders(orders);
    return updated;
  }

  // Fetch current historial first
  const { data: existing, error: fetchError } = await supabase
    .from('pedidos')
    .select('historial')
    .eq('id', orderId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const newNode = {
    estado: newStatus,
    fecha: new Date().toISOString(),
    modificadoPor: currentUser.uid,
    modificadoPorNombre: currentUser.usuario
  };

  const { data, error } = await supabase
    .from('pedidos')
    .update({
      estado: newStatus,
      actualizado_en: new Date().toISOString(),
      historial: [...(existing.historial || []), newNode]
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToOrder(data);
};

// ─── Subscribe to Orders (realtime) ──────────────────────────────────────────
export const subscribeToOrders = (callback, filters = {}) => {
  if (!hasSupabaseCredentials) {
    const id = Math.random().toString(36).substr(2, 9);
    mockListeners.push({ id, callback, filters });
    callback(filterAndSort(getMockOrders(), filters));
    return () => { mockListeners = mockListeners.filter(l => l.id !== id); };
  }

  // Initial fetch
  const fetchOrders = async () => {
    let query = supabase.from('pedidos').select('*');
    if (filters.sede && filters.sede !== 'TODAS') {
      query = query.eq('sede', filters.sede);
    }
    query = query.order('fecha_entrega', { ascending: true });
    const { data, error } = await query;
    if (!error && data) callback(data.map(rowToOrder));
  };

  fetchOrders();

  // Realtime subscription
  const channel = supabase
    .channel('pedidos-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
      fetchOrders();
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
};

// ─── Get single order ─────────────────────────────────────────────────────────
export const getOrderById = async (orderId) => {
  if (!hasSupabaseCredentials) {
    const orders = getMockOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error('Pedido no encontrado');
    return order;
  }

  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) throw new Error(error.message);
  return rowToOrder(data);
};

// ─── Upload image ─────────────────────────────────────────────────────────────
export const uploadReferenceImage = async (file) => {
  if (!hasSupabaseCredentials) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (e) => reject(new Error('Error al leer imagen: ' + e.target.error));
      reader.readAsDataURL(file);
    });
  }

  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const { data, error } = await supabase.storage
    .from('referencias')
    .upload(fileName, file);

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage
    .from('referencias')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};
