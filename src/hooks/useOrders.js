import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { subscribeToOrders, createOrder, updateOrderStatus } from '../services/orders';

export const useOrders = (selectedSede = null) => {
  const { user } = useAuth();

  // Determine branch filter based on user permissions
  // Vendedores are strictly scoped to their own branch (sede)
  // Admins can scope to a selected branch or see all ('TODAS')
  const activeSedeFilter = user?.rol === 'admin' 
    ? (selectedSede || 'TODAS') 
    : (user?.sede || '');

  const cacheKey = `pedidosuca_cached_orders_${activeSedeFilter}`;
  
  const getCachedOrders = () => {
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  };

  const [orders, setOrders] = useState(getCachedOrders);
  const [loading, setLoading] = useState(() => getCachedOrders().length === 0);

  useEffect(() => {
    if (!user) return;

    const currentCached = getCachedOrders();
    setOrders(currentCached);
    setLoading(currentCached.length === 0);

    const filters = { sede: activeSedeFilter };
    
    const unsubscribe = subscribeToOrders((updatedOrders) => {
      setOrders(updatedOrders);
      setLoading(false);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(updatedOrders));
      } catch (e) {
        console.error('Error writing orders cache:', e);
      }
    }, filters);

    return () => unsubscribe();
  }, [user, activeSedeFilter]);

  const addOrder = async (orderData) => {
    if (!user) throw new Error('Usuario no autenticado');
    // Ensure new orders match the seller's branch
    const finalSede = user.rol === 'admin' ? orderData.sede : user.sede;
    return await createOrder({ ...orderData, sede: finalSede }, user);
  };

  const updateStatus = async (orderId, newStatus) => {
    if (!user) throw new Error('Usuario no autenticado');
    return await updateOrderStatus(orderId, newStatus, user);
  };

  return {
    orders,
    loading,
    addOrder,
    updateStatus
  };
};
