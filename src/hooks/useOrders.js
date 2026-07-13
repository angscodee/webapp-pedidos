import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { subscribeToOrders, createOrder, updateOrderStatus } from '../services/orders';

export const useOrders = (selectedSede = null) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine branch filter based on user permissions
  // Vendedores are strictly scoped to their own branch (sede)
  // Admins can scope to a selected branch or see all ('TODAS')
  const activeSedeFilter = user?.rol === 'admin' 
    ? (selectedSede || 'TODAS') 
    : (user?.sede || '');

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const filters = { sede: activeSedeFilter };
    
    const unsubscribe = subscribeToOrders((updatedOrders) => {
      setOrders(updatedOrders);
      setLoading(false);
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
