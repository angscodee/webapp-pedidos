import React, { createContext, useState, useEffect } from 'react';
import { subscribeToAuth, signIn, signOutUser, registerNewUser } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Listen to authentication changes
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const loggedUser = await signIn(email, password);
      return loggedUser;
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Error in logout:', err);
    }
  };

  const registerUser = async (email, password, usuario, sede, rol) => {
    try {
      return await registerNewUser(email, password, usuario, sede, rol);
    } catch (err) {
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    registerUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
