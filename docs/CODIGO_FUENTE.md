# Documento de Código Fuente Completo - PedidosUCA
**Sistema de Gestión de Pedidos Centralizado - Uno con Aroma**
*Generado el 20 de Julio de 2026*

Este documento consolida la totalidad del código fuente de la plataforma **PedidosUCA**, incluyendo configuraciones, servicios de backend Supabase, lógica de autenticación, hooks personalizados, componentes reactivos y vistas de interfaz.

---

## 📋 Índice del Código Fuente

1. [package.json](#packagejson)
2. [vite.config.js](#viteconfigjs)
3. [index.html](#indexhtml)
4. [src/main.jsx](#srcmainjsx)
5. [src/App.jsx](#srcappjsx)
6. [src/index.css](#srcindexcss)
7. [src/context/AuthContext.jsx](#srccontextauthcontextjsx)
8. [src/hooks/useAuth.js](#srchooksuseauthjs)
9. [src/hooks/useOrders.js](#srchooksuseordersjs)
10. [src/services/supabase.js](#srcservicessupabasejs)
11. [src/services/auth.js](#srcservicesauthjs)
12. [src/services/orders.js](#srcservicesordersjs)
13. [src/components/StatusBadge.jsx](#srccomponentsstatusbadgejsx)
14. [src/components/StatCard.jsx](#srccomponentsstatcardjsx)
15. [src/components/OrderCard.jsx](#srccomponentsordercardjsx)
16. [src/components/OrderForm.jsx](#srccomponentsorderformjsx)
17. [src/pages/Login.jsx](#srcpagesloginjsx)
18. [src/pages/Dashboard.jsx](#srcpagesdashboardjsx)
19. [src/pages/OrderDetail.jsx](#srcpagesorderdetailjsx)
20. [src/pages/AdminPanel.jsx](#srcpagesadminpaneljsx)

---

<a id="packagejson"></a>
### 📄 `package.json` (35 líneas)

```json
{
  "name": "pry-uca",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.108.2",
    "@tailwindcss/vite": "^4.3.1",
    "firebase": "^12.15.0",
    "lucide-react": "^1.21.0",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-router-dom": "^7.18.0",
    "tailwindcss": "^4.3.1",
    "vite-plugin-pwa": "^1.3.0"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.3.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "vite": "^8.0.12"
  }
}

```

---

<a id="viteconfigjs"></a>
### 📄 `vite.config.js` (47 líneas)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png'],
      manifest: {
        name: 'PedidosUCA - Uno con Aroma',
        short_name: 'PedidosUCA',
        description: 'Sistema de Gestión de Pedidos Centralizado - Uno con Aroma',
        theme_color: '#E2A123',
        background_color: '#FCFBF7',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,ico}'],
        skipWaiting: true,
        clientsClaim: true
      }
    })
  ],
})


```

---

<a id="indexhtml"></a>
### 📄 `index.html` (19 líneas)

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/icon-192.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
    <meta name="description" content="PedidosUCA - Sistema centralizado de gestión de pedidos para la pastelería Uno con Aroma en Trujillo." />
    <title>PedidosUCA - Uno con Aroma</title>
  </head>
  <body class="bg-amber-50/20 text-slate-800 antialiased selection:bg-amber-200">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>


```

---

<a id="srcmainjsx"></a>
### 📄 `src/main.jsx` (11 líneas)

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

---

<a id="srcappjsx"></a>
### 📄 `src/App.jsx` (93 líneas)

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { OrderDetail } from './pages/OrderDetail';
import { AdminPanel } from './pages/AdminPanel';

// Route guard for authenticated users
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-slate-50 gap-2">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-400">Verificando sesión...</span>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Route guard for admin access only
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-slate-50 gap-2">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-400">Verificando permisos...</span>
      </div>
    );
  }
  
  if (!user || user.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public login route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/order/:id" 
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } 
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

```

---

<a id="srcindexcss"></a>
### 📄 `src/index.css` (69 líneas)

```css
@import "tailwindcss";

@theme {
  --font-sans: 'Inter', sans-serif;
  --font-display: 'Outfit', sans-serif;
  --color-brand-primary: #E2A123;
  --color-brand-hover: #D97706;
  --color-brand-light: #FEF3C7;
  --color-brand-dark: #3730A3; /* Indigo accents if needed, otherwise warm slate */
}

@layer base {
  body {
    font-family: 'Inter', sans-serif;
    background-color: #FCFBF7;
    -webkit-tap-highlight-color: transparent;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Outfit', sans-serif;
  }
}

/* Premium micro-interactions & utility classes */
.glass-amber {
  background: rgba(255, 253, 245, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(226, 161, 35, 0.15);
}

.glass-header {
  background: rgba(226, 161, 35, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.shadow-premium {
  box-shadow: 0 4px 20px -2px rgba(226, 161, 35, 0.08), 0 2px 8px -1px rgba(0, 0, 0, 0.03);
}

.shadow-floating {
  box-shadow: 0 10px 25px -5px rgba(226, 161, 35, 0.3), 0 8px 16px -6px rgba(226, 161, 35, 0.2);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Bottom Sheet Slide Up Animation Classes */
.bottom-sheet-enter {
  transform: translateY(100%);
}
.bottom-sheet-enter-active {
  transform: translateY(0);
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
.bottom-sheet-exit {
  transform: translateY(0);
}
.bottom-sheet-exit-active {
  transform: translateY(100%);
  transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
}

```

---

<a id="srccontextauthcontextjsx"></a>
### 📄 `src/context/AuthContext.jsx` (63 líneas)

```jsx
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

```

---

<a id="srchooksuseauthjs"></a>
### 📄 `src/hooks/useAuth.js` (11 líneas)

```javascript
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

```

---

<a id="srchooksuseordersjs"></a>
### 📄 `src/hooks/useOrders.js` (73 líneas)

```javascript
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { subscribeToOrders, createOrder, updateOrderStatus } from '../services/orders';

export const useOrders = (selectedSede = null) => {
  const { user } = useAuth();

  // Determine branch filter based on user permissions
  // Admins, Vendedor SD, and Pastelero can scope to a selected branch or see all ('TODAS')
  const canSeeAllSedes = user?.rol === 'admin' || 
                         user?.rol === 'pastelero' || 
                         (user?.rol === 'vendedor' && user?.sede === 'SD');

  const activeSedeFilter = canSeeAllSedes
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

```

---

<a id="srcservicessupabasejs"></a>
### 📄 `src/services/supabase.js` (11 líneas)

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseCredentials = !!(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

```

---

<a id="srcservicesauthjs"></a>
### 📄 `src/services/auth.js` (195 líneas)

```javascript
import { supabase, hasSupabaseCredentials } from './supabase';

// ─── Mock fallback data ───────────────────────────────────────────────────────
const DEFAULT_MOCK_USERS = [
  {
    uid: 'admin-mock-uid',
    usuario: 'Administrador General',
    email: 'admin@unoconaroma.com',
    password: 'admin123',
    sede: 'SD',
    rol: 'admin'
  },
  {
    uid: 'vendedor-sd-uid',
    usuario: 'Vendedor SD',
    email: 'sd@unoconaroma.com',
    password: 'sd123',
    sede: 'SD',
    rol: 'vendedor'
  },
  {
    uid: 'vendedor-florencia-uid',
    usuario: 'Vendedor Florencia',
    email: 'fm@unoconaroma.com',
    password: 'fm123',
    sede: 'Florencia',
    rol: 'vendedor'
  },
  {
    uid: 'vendedor-penta-uid',
    usuario: 'Vendedor Penta',
    email: 'penta@unoconaroma.com',
    password: 'penta123',
    sede: 'Penta',
    rol: 'vendedor'
  },
  {
    uid: 'vendedor-porvenir-uid',
    usuario: 'Vendedor Porvenir',
    email: 'porvenir@unoconaroma.com',
    password: 'pv123',
    sede: 'Porvenir',
    rol: 'vendedor'
  },
  {
    uid: 'vendedor-quintanas-uid',
    usuario: 'Vendedor Las Quintanas',
    email: 'quintanas@unoconaroma.com',
    password: 'qt123',
    sede: 'Las Quintanas',
    rol: 'vendedor'
  },
  {
    uid: 'pastelero-mock-uid',
    usuario: 'Pastelero Principal',
    email: 'pastelero@unoconaroma.com',
    password: 'pastelerouca',
    sede: 'SD',
    rol: 'pastelero'
  }
];

const getMockUsers = () => {
  const users = localStorage.getItem('pedidosuca_users');
  if (!users) {
    localStorage.setItem('pedidosuca_users', JSON.stringify(DEFAULT_MOCK_USERS));
    return DEFAULT_MOCK_USERS;
  }
  return JSON.parse(users);
};

// Mock auth state
let mockAuthStateListeners = [];
let currentMockUser = null;
const savedUser = localStorage.getItem('pedidosuca_current_user');
if (savedUser) currentMockUser = JSON.parse(savedUser);

const notifyMockAuthListeners = () => {
  mockAuthStateListeners.forEach(cb => cb(currentMockUser));
};

// ─── Sign In ──────────────────────────────────────────────────────────────────
export const signIn = async (email, password) => {
  if (!hasSupabaseCredentials) {
    // Mock mode
    const users = getMockUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Credenciales incorrectas');
    currentMockUser = { ...found };
    localStorage.setItem('pedidosuca_current_user', JSON.stringify(currentMockUser));
    notifyMockAuthListeners();
    return currentMockUser;
  }

  // Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Credenciales incorrectas');

  // Fetch profile from usuarios table
  const { data: profile, error: profileError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('uid', data.user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('El usuario no tiene un perfil en el sistema. Contacte al administrador.');
  }

  const mappedRol = (profile.rol === 'pastelero' || profile.email?.toLowerCase() === 'pedidos@unoconaroma.com' || profile.usuario?.toLowerCase().includes('pastelero')) ? 'pastelero' : profile.rol;

  return { uid: data.user.id, email: data.user.email, ...profile, rol: mappedRol };
};

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export const signOutUser = async () => {
  if (!hasSupabaseCredentials) {
    currentMockUser = null;
    localStorage.removeItem('pedidosuca_current_user');
    notifyMockAuthListeners();
    return;
  }
  await supabase.auth.signOut();
};

// ─── Register new user (admin only) ──────────────────────────────────────────
export const registerNewUser = async (email, password, usuario, sede, rol) => {
  if (!hasSupabaseCredentials) {
    const users = getMockUsers();
    if (users.some(u => u.email === email)) throw new Error('El correo ya está registrado.');
    const newUser = {
      uid: 'user-' + Math.random().toString(36).substr(2, 9),
      usuario, email, password, sede, rol
    };
    users.push(newUser);
    localStorage.setItem('pedidosuca_users', JSON.stringify(users));
    return newUser;
  }

  // Create auth user via Supabase Admin (using anon key — requires signup)
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);

  const uid = data.user.id;

  // Save profile to usuarios table
  // If the role is 'pastelero', save it as 'vendedor' in the database to satisfy check constraints.
  const dbRol = rol === 'pastelero' ? 'vendedor' : rol;
  const { error: insertError } = await supabase
    .from('usuarios')
    .insert([{ uid, usuario, email, sede, rol: dbRol }]);

  if (insertError) throw new Error(insertError.message);

  return { uid, usuario, email, sede, rol };
};

// ─── Subscribe to auth state changes ─────────────────────────────────────────
export const subscribeToAuth = (callback) => {
  if (!hasSupabaseCredentials) {
    mockAuthStateListeners.push(callback);
    callback(currentMockUser);
    return () => {
      mockAuthStateListeners = mockAuthStateListeners.filter(cb => cb !== callback);
    };
  }

  // Supabase auth listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const { data: profile } = await supabase
        .from('usuarios')
        .select('*')
        .eq('uid', session.user.id)
        .single();

      if (profile) {
        const mappedRol = (profile.rol === 'pastelero' || profile.email?.toLowerCase() === 'pedidos@unoconaroma.com' || profile.usuario?.toLowerCase().includes('pastelero')) ? 'pastelero' : profile.rol;
        callback({ uid: session.user.id, email: session.user.email, ...profile, rol: mappedRol });
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });

  return () => subscription.unsubscribe();
};

export const seedMockDatabase = () => {
  localStorage.setItem('pedidosuca_users', JSON.stringify(DEFAULT_MOCK_USERS));
  return DEFAULT_MOCK_USERS;
};

```

---

<a id="srcservicesordersjs"></a>
### 📄 `src/services/orders.js` (420 líneas)

```javascript
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

// ─── Update Order Details ─────────────────────────────────────────────────────
export const updateOrder = async (orderId, orderData, currentUser) => {
  const {
    cliente, telefono, producto, cantidad, observaciones,
    fechaEntrega, sede, precioTotal, montoPagado, imagenReferencia
  } = orderData;

  const editNode = {
    estado: 'editado',
    fecha: new Date().toISOString(),
    modificadoPor: currentUser.uid,
    modificadoPorNombre: currentUser.usuario || 'Usuario UCA'
  };

  if (!hasSupabaseCredentials) {
    const orders = getMockOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('Pedido no encontrado');
    const order = orders[index];
    const updated = {
      ...order,
      cliente,
      telefono,
      producto,
      cantidad: Number(cantidad),
      observaciones: observaciones || '',
      fechaEntrega: fechaEntrega instanceof Date ? fechaEntrega.toISOString() : fechaEntrega,
      sede,
      precioTotal: Number(precioTotal) || 0,
      montoPagado: Number(montoPagado) || 0,
      imagenReferencia: imagenReferencia !== undefined ? imagenReferencia : order.imagenReferencia,
      actualizadoEn: new Date().toISOString(),
      historial: [...(order.historial || []), editNode]
    };
    orders[index] = updated;
    saveMockOrders(orders);
    return updated;
  }

  // Supabase implementation
  // Fetch existing order to get current history and image
  const { data: existing, error: fetchError } = await supabase
    .from('pedidos')
    .select('historial, imagen_referencia, estado')
    .eq('id', orderId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const updatedEditNode = {
    ...editNode,
    estado: existing.estado || 'registrado' // keep current state in the history node
  };

  const { data, error } = await supabase
    .from('pedidos')
    .update({
      cliente,
      telefono,
      producto,
      cantidad: Number(cantidad),
      observaciones: observaciones || '',
      fecha_entrega: fechaEntrega instanceof Date ? fechaEntrega.toISOString() : fechaEntrega,
      sede,
      precio_total: Number(precioTotal) || 0,
      monto_pagado: Number(montoPagado) || 0,
      imagen_referencia: imagenReferencia !== undefined ? imagenReferencia : existing.imagen_referencia,
      actualizado_en: new Date().toISOString(),
      historial: orderData.historial !== undefined ? orderData.historial : [...(existing.historial || []), updatedEditNode]
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

// ─── Delete Order (Admin-only) ────────────────────────────────────────────────
export const deleteOrder = async (orderId) => {
  if (!hasSupabaseCredentials) {
    const orders = getMockOrders();
    const filtered = orders.filter(o => o.id !== orderId);
    saveMockOrders(filtered);
    return true;
  }

  const { error } = await supabase
    .from('pedidos')
    .delete()
    .eq('id', orderId);

  if (error) throw new Error(error.message);
  return true;
};

```

---

<a id="srccomponentsstatusbadgejsx"></a>
### 📄 `src/components/StatusBadge.jsx` (31 líneas)

```jsx
import React from 'react';

const STATUS_CONFIGS = {
  registrado: {
    label: 'Registrado',
    classes: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  en_sede: {
    label: 'En Sede',
    classes: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  entregado: {
    label: 'Entregado',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIGS[status] || {
    label: status,
    classes: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.classes}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current"></span>
      {config.label}
    </span>
  );
};

```

---

<a id="srccomponentsstatcardjsx"></a>
### 📄 `src/components/StatCard.jsx` (39 líneas)

```jsx
import React from 'react';

export const StatCard = ({ label, value, icon: Icon, color = 'amber' }) => {
  const colorMaps = {
    amber: {
      bg: 'bg-amber-50/50',
      iconBg: 'bg-amber-100 text-amber-700',
      border: 'border-amber-100',
      valueColor: 'text-amber-800'
    },
    orange: {
      bg: 'bg-orange-50/50',
      iconBg: 'bg-orange-100 text-orange-700',
      border: 'border-orange-100',
      valueColor: 'text-orange-800'
    },
    emerald: {
      bg: 'bg-emerald-50/50',
      iconBg: 'bg-emerald-100 text-emerald-700',
      border: 'border-emerald-100',
      valueColor: 'text-emerald-800'
    }
  };

  const currentTheme = colorMaps[color] || colorMaps.amber;

  return (
    <div className={`flex items-center justify-between p-2 sm:p-4 rounded-2xl border ${currentTheme.bg} ${currentTheme.border} shadow-premium transition-all duration-300 hover:scale-[1.02] gap-1.5 w-full`}>
      <div className="space-y-0.5 sm:space-y-1 text-left min-w-0 flex-1">
        <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 block truncate">{label}</span>
        <h3 className={`text-sm sm:text-2xl font-black ${currentTheme.valueColor} tracking-tight`}>{value}</h3>
      </div>
      <div className={`p-1.5 sm:p-3 rounded-xl ${currentTheme.iconBg} shrink-0`}>
        <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[2.5]" />
      </div>
    </div>
  );
};

```

---

<a id="srccomponentsordercardjsx"></a>
### 📄 `src/components/OrderCard.jsx` (230 líneas)

```jsx
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

  // Warning alert: if delivery scheduled before 3 PM (15:00), must be in branch by the day before.
  // If it is the delivery day (or later) and still 'registrado', show warning.
  const isLateWarning = estado === 'registrado' && (() => {
    try {
      const delivery = toDate(fechaEntrega);
      if (delivery.getHours() < 15) {
        const startOfDeliveryDay = new Date(delivery.getFullYear(), delivery.getMonth(), delivery.getDate());
        return new Date() >= startOfDeliveryDay;
      }
    } catch (e) {}
    return false;
  })();

  const getProductionStatus = () => {
    if (!order || !order.historial) return { status: 'none' };
    const uploads = [...order.historial].reverse().filter(h => h.estado === 'produccion_lista' || h.imagenProduccion);
    const approvals = [...order.historial].reverse().filter(h => h.estado === 'produccion_aprobada' || h.estado === 'produccion_corregir');
    
    const latestUpload = uploads[0];
    const latestApproval = approvals[0];
    
    if (!latestUpload) return { status: 'none' };
    
    if (latestApproval && new Date(latestApproval.fecha) > new Date(latestUpload.fecha)) {
      return {
        status: latestApproval.estado === 'produccion_aprobada' ? 'aprobado' : 'corregir'
      };
    }
    return { status: 'pendiente' };
  };

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
          {user?.rol !== 'pastelero' && (
            <div className="flex gap-2">
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle size={14} className="stroke-[2.5]" />
                <span>WhatsApp</span>
              </a>
            </div>
          )}

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
            {nextAction && user?.rol !== 'pastelero' && (() => {
              const isTransitionDisabled = nextAction.status === 'en_sede' && getProductionStatus().status !== 'aprobado';
              return (
                <button 
                  onClick={(e) => handleStatusChange(e, nextAction.status)}
                  disabled={isTransitionDisabled}
                  className={`w-full sm:flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${nextAction.classes} ${isTransitionDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  title={isTransitionDisabled ? 'Requiere Visto Bueno de producción' : ''}
                >
                  <nextAction.icon size={14} className="stroke-[2.5]" />
                  <span>{nextAction.label} {isTransitionDisabled ? '(Falta V°B°)' : ''}</span>
                </button>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

```

---

<a id="srccomponentsorderformjsx"></a>
### 📄 `src/components/OrderForm.jsx` (574 líneas)

```jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, Clipboard, DollarSign, Image as ImageIcon, ShoppingBag, Weight, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { uploadReferenceImage } from '../services/orders';

const CAKE_PRODUCTS = [
  'Tres leches',
  'Selva Negra',
  'Sublime',
  'Chocolate',
  'Torta Vainilla',
  'Oreo',
  'Capucchino',
  'Torta Helada Pequeña',
  'Torta Helada Mediana',
  'Torta Helada Grande',
  'Cheescake Maracuyá',
  'Pie Limón',
  'Torta Personalizada'
];

const OTHER_PRODUCTS = [
  'Pedido Pan Pullman',
  'Pedido Pan Masa Madre',
  'Pedido de Pan clásico',
  'Pedido especial',
  'Bocaditos (especificar cantidad)'
];

const PRODUCTS = [...CAKE_PRODUCTS, ...OTHER_PRODUCTS];

const WEIGHT_OPTIONS = ['1/2 kg', '3/4 kg', '1 kg', '1 1/4 kg', 'Otro'];

const SEDES = ['SD', 'Florencia', 'Penta', 'Porvenir', 'Las Quintanas'];

const formatDateForInput = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    return '';
  }
};

export const OrderForm = ({ isOpen, onClose, onSubmit, initialData }) => {
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

  // Populate or reset form on open/change
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const isCustomPeso = initialData.peso && !WEIGHT_OPTIONS.includes(initialData.peso);
        setFormData({
          cliente: initialData.cliente || '',
          telefono: initialData.telefono || '',
          producto: initialData.producto || PRODUCTS[0],
          cantidad: initialData.cantidad || 1,
          peso: isCustomPeso ? 'Otro' : (initialData.peso || WEIGHT_OPTIONS[2]),
          pesoPersonalizado: isCustomPeso ? initialData.peso : '',
          fechaEntrega: formatDateForInput(initialData.fechaEntrega),
          observaciones: initialData.observaciones || '',
          imagenReferencia: initialData.imagenReferencia || '',
          precioTotal: initialData.precioTotal !== undefined ? initialData.precioTotal : '',
          pagoCompleto: Number(initialData.precioTotal) === Number(initialData.montoPagado),
          montoPagado: initialData.montoPagado !== undefined ? initialData.montoPagado : '',
          sede: initialData.sede || user?.sede || SEDES[0]
        });
        setImagePreview(initialData.imagenReferencia || '');
        setImageFile(null);
      } else {
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
        setImagePreview('');
        setImageFile(null);
      }
      setError('');
    }
  }, [isOpen, initialData, user]);

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
    if (CAKE_PRODUCTS.includes(formData.producto) && formData.peso === 'Otro' && !formData.pesoPersonalizado.trim()) {
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

      const isCake = CAKE_PRODUCTS.includes(formData.producto);
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
      setError(err.message || (initialData ? 'Error al guardar cambios' : 'Error al registrar pedido'));
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
            {initialData ? 'Editar Pedido' : 'Registrar Nuevo Pedido'}
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
                
                {CAKE_PRODUCTS.includes(formData.producto) ? (
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
                    Otros (N/A)
                  </div>
                )}
              </div>
            </div>

            {/* Custom Weight Input */}
            {CAKE_PRODUCTS.includes(formData.producto) && formData.peso === 'Otro' && (
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
                  min={initialData ? undefined : getMinDateTimeString()}
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
              initialData ? 'Guardar Cambios' : 'Registrar Pedido'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

```

---

<a id="srcpagesloginjsx"></a>
### 📄 `src/pages/Login.jsx` (118 líneas)

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Cake, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 focus:bg-white transition-all text-slate-700 font-medium"
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
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 focus:bg-white transition-all text-slate-700 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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

```

---

<a id="srcpagesdashboardjsx"></a>
### 📄 `src/pages/Dashboard.jsx` (396 líneas)

```jsx
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

  const canSeeAllSedes = user?.rol === 'admin' || 
                         user?.rol === 'pastelero' || 
                         (user?.rol === 'vendedor' && user?.sede === 'SD');

  // Scope branch selector for privileged roles. Default is "TODAS"
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

  // Request browser notifications for bakers
  React.useEffect(() => {
    if (user?.rol === 'pastelero' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      const todayStr = new Date().toDateString();
      const todayPending = orders.filter(o => {
        const d = toDate(o.fechaEntrega);
        return d.toDateString() === todayStr && o.estado === 'registrado';
      });

      if (todayPending.length > 0 && Notification.permission === 'granted') {
        try {
          new Notification("Pedidos del Día - UCA", {
            body: `Tienes ${todayPending.length} pedido(s) por preparar hoy.`,
            tag: 'uca-today-orders'
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [user, orders]);

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
                  Sede: {canSeeAllSedes ? 'Ver Todas' : user?.sede}
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

          {/* Sede Selector Row */}
          {canSeeAllSedes && (
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
        {/* Pastelero Alerts Banner */}
        {user?.rol === 'pastelero' && (() => {
          const todayStr = new Date().toDateString();
          const todayPending = orders.filter(o => {
            const d = toDate(o.fechaEntrega);
            return d.toDateString() === todayStr && o.estado === 'registrado';
          });

          if (todayPending.length === 0) return null;

          return (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl shadow-sm flex items-start gap-3 text-amber-900 animate-fadeIn">
              <span className="text-xl">📢</span>
              <div className="space-y-1">
                <h4 className="font-bold text-sm">Recordatorio de Producción</h4>
                <p className="text-xs text-amber-800 font-medium">
                  Tienes **{todayPending.length} pedido(s)** pendientes de preparar para hoy:
                </p>
                <ul className="list-disc pl-4 text-xs font-semibold space-y-0.5 text-amber-700 mt-1">
                  {todayPending.map(o => (
                    <li key={o.id}>
                      {o.cliente} - {o.producto} ({o.cantidad}x) - {new Date(o.fechaEntrega).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })()}

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
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-amber-50/5 text-slate-700 font-medium"
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
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-amber-50/5 text-slate-700 font-bold appearance-none"
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

```

---

<a id="srcpagesorderdetailjsx"></a>
### 📄 `src/pages/OrderDetail.jsx` (667 líneas)

```jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getOrderById, updateOrderStatus, updateOrder, deleteOrder, uploadReferenceImage, toDate } from '../services/orders';
import { StatusBadge } from '../components/StatusBadge';
import { OrderForm } from '../components/OrderForm';
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
  RotateCcw,
  Pencil,
  Trash2,
  Upload,
  Check,
  AlertTriangle
} from 'lucide-react';

export const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);

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

  const handleEditSubmit = async (orderPayload) => {
    if (!order || !user) return;
    try {
      const updatedOrder = await updateOrder(order.id, orderPayload, user);
      setOrder(updatedOrder);
      setIsEditOpen(false);
    } catch (e) {
      alert('Error al actualizar pedido: ' + e.message);
    }
  };

  const handleDeleteClick = async () => {
    if (!order) return;
    if (window.confirm('¿Está seguro de que desea eliminar este pedido permanentemente?')) {
      try {
        setUpdating(true);
        await deleteOrder(order.id);
        navigate('/');
      } catch (e) {
        alert('Error al eliminar pedido: ' + e.message);
      } finally {
        setUpdating(false);
      }
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);
  const [correctionComment, setCorrectionComment] = useState('');

  const getProductionStatus = () => {
    if (!order || !order.historial) return { photo: null, status: 'none', comment: '' };
    
    const uploads = [...order.historial].reverse().filter(h => h.estado === 'produccion_lista' || h.imagenProduccion);
    const approvals = [...order.historial].reverse().filter(h => h.estado === 'produccion_aprobada' || h.estado === 'produccion_corregir');
    
    const latestUpload = uploads[0];
    const latestApproval = approvals[0];
    
    if (!latestUpload) {
      return { photo: null, status: 'none', comment: '' };
    }
    
    if (latestApproval && new Date(latestApproval.fecha) > new Date(latestUpload.fecha)) {
      return {
        photo: latestUpload.imagenProduccion,
        status: latestApproval.estado === 'produccion_aprobada' ? 'aprobado' : 'corregir',
        comment: latestApproval.comentario || '',
        by: latestApproval.modificadoPorNombre
      };
    }
    
    return {
      photo: latestUpload.imagenProduccion,
      status: 'pendiente',
      comment: '',
      by: latestUpload.modificadoPorNombre
    };
  };

  const handleProductionPhotoUpload = async (e) => {
    console.log('handleProductionPhotoUpload triggered');
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    if (!order || !user) {
      console.error('Missing order or user context:', { order, user });
      return;
    }
    
    console.log('Selected file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    try {
      setUploadingImage(true);
      console.log('Starting Supabase Storage upload...');
      const imageUrl = await uploadReferenceImage(file);
      console.log('Supabase Storage upload succeeded! Image URL:', imageUrl);
      
      const productionNode = {
        estado: 'produccion_lista',
        fecha: new Date().toISOString(),
        modificadoPor: user.uid,
        modificadoPorNombre: user.usuario || 'Pastelero',
        imagenProduccion: imageUrl
      };
      
      console.log('Updating order history in database...', productionNode);
      const updatedOrder = await updateOrder(order.id, {
        ...order,
        fechaEntrega: order.fechaEntrega,
        historial: [...(order.historial || []), productionNode]
      }, user);
      
      console.log('Order updated in database successfully:', updatedOrder);
      setOrder(updatedOrder);
      alert('Foto de producción subida con éxito.');
    } catch (err) {
      console.error('Error in handleProductionPhotoUpload:', err);
      alert('Error al subir foto: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProductionApproval = async (approve) => {
    if (!order || !user) return;
    if (!approve && !correctionComment.trim()) {
      alert('Por favor, ingrese un comentario explicando la corrección requerida.');
      return;
    }
    
    try {
      setUpdating(true);
      
      const approvalNode = {
        estado: approve ? 'produccion_aprobada' : 'produccion_corregir',
        fecha: new Date().toISOString(),
        modificadoPor: user.uid,
        modificadoPorNombre: user.usuario || 'Usuario',
        comentario: approve ? '' : correctionComment.trim()
      };
      
      const updatedOrder = await updateOrder(order.id, {
        ...order,
        fechaEntrega: order.fechaEntrega,
        historial: [...(order.historial || []), approvalNode]
      }, user);
      
      setOrder(updatedOrder);
      setCorrectionComment('');
      alert(approve ? 'Pedido aprobado con éxito.' : 'Corrección solicitada con éxito.');
    } catch (err) {
      alert('Error al procesar acción: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatuses = () => {
    if (!order) return [];
    
    // Both Admins and Sellers follow the same strict sequential flow to keep the UI clean
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

  // Warning alert: if delivery scheduled before 3 PM (15:00), must be in branch by the day before.
  // If it is the delivery day (or later) and still 'registrado', show warning.
  const isLateWarning = estado === 'registrado' && (() => {
    try {
      const delivery = toDate(fechaEntrega);
      if (delivery.getHours() < 15) {
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
            <div className="flex flex-col">
              <h2 className="text-base font-black text-slate-800">Detalle de Pedido</h2>
              <span className="text-[9px] font-black text-amber-500 tracking-wider leading-none">v1.4 (08:50 AM)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user?.rol === 'admin' && (
              <button 
                onClick={handleDeleteClick}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-100 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
                title="Eliminar Pedido"
              >
                <Trash2 size={13} className="stroke-[2.5]" />
                <span>Eliminar</span>
              </button>
            )}
            {user?.rol !== 'pastelero' && (
              <button 
                onClick={() => setIsEditOpen(true)}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl border border-amber-100/50 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
                title="Editar Pedido"
              >
                <Pencil size={13} className="stroke-[2.5]" />
                <span>Editar</span>
              </button>
            )}
            <StatusBadge status={estado} />
          </div>
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
                    ⚠️ Alerta: Pedido de la mañana (debe enviarse el día anterior a las 3 PM)
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-amber-600 flex items-center gap-1">
                <MapPin size={14} /> Sede {sede}
              </p>
            </div>
            
            {user?.rol !== 'pastelero' && (
              <div className="flex gap-2 items-center">
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/10 transition-all active:scale-95 flex items-center gap-1.5 font-bold text-xs"
                  title="WhatsApp Cliente"
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp</span>
                </a>
              </div>
            )}
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

        {/* Control de Producción (Pastelería) Card */}
        <section className="bg-white rounded-3xl border border-slate-100 p-5 shadow-premium space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Control de Producción</h4>
            {(() => {
              const prod = getProductionStatus();
              if (prod.status === 'aprobado') {
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase flex items-center gap-1"><Check size={10} className="stroke-[3]" /> Aprobado</span>;
              } else if (prod.status === 'corregir') {
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 uppercase flex items-center gap-1"><AlertTriangle size={10} /> Corregir</span>;
              } else if (prod.status === 'pendiente') {
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 uppercase animate-pulse">Pendiente V°B°</span>;
              }
              return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-500 uppercase">Sin iniciar</span>;
            })()}
          </div>

          {/* Render Production Photo if exists */}
          {(() => {
            const prod = getProductionStatus();
            if (!prod.photo) {
              return (
                <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-semibold text-slate-400">No se ha subido foto del pedido terminado.</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden border border-slate-100 aspect-video relative bg-slate-50">
                  <img src={prod.photo} alt="Foto de producción terminada" className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Subida por: <span className="text-slate-600">{prod.by || 'Pastelero'}</span>
                </p>
                {prod.comment && (
                  <div className="bg-rose-50 border border-rose-100/50 text-rose-800 rounded-2xl p-3.5 text-xs font-medium leading-relaxed">
                    <p className="font-bold text-[10px] uppercase text-rose-500 mb-1">Motivo de corrección (por {prod.by}):</p>
                    {prod.comment}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Baker actions: file upload */}
          {user?.rol === 'pastelero' && (() => {
            const prodStatus = getProductionStatus();
            const canUpload = estado === 'registrado' && (prodStatus.status === 'none' || prodStatus.status === 'corregir');

            if (!canUpload) {
              if (prodStatus.status === 'pendiente') {
                return (
                  <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-2xl text-center">
                    <p className="text-xs font-bold text-amber-800">Foto enviada. Esperando visto bueno de la sede...</p>
                  </div>
                );
              }
              if (prodStatus.status === 'aprobado') {
                return (
                  <div className="bg-emerald-50 border border-emerald-200/50 p-4 rounded-2xl text-center">
                    <p className="text-xs font-bold text-emerald-800">✓ Producción aprobada. El pedido ya no permite más modificaciones de foto.</p>
                  </div>
                );
              }
              return null;
            }

            return (
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-amber-400 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-4 pb-4 text-slate-400 group-hover:text-amber-500">
                    <Upload size={20} className="mb-1 stroke-[1.5] animate-bounce" />
                    <p className="text-xs font-bold">{uploadingImage ? 'Subiendo imagen...' : 'Subir Foto Terminado (V°B°)'}</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProductionPhotoUpload}
                    disabled={uploadingImage}
                    className="sr-only"
                  />
                </label>
              </div>
            );
          })()}

          {/* Seller / Admin actions: approve or request correction */}
          {(() => {
            const prod = getProductionStatus();
            const canReview = user?.rol === 'admin' || (user?.rol === 'vendedor' && user?.sede === sede);
            
            if (!prod.photo || !canReview || prod.status === 'aprobado') return null;

            return (
              <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Revisión de Sede</span>
                
                <textarea
                  placeholder="Detalles sobre corrección (requerido si pides corregir)..."
                  value={correctionComment}
                  onChange={(e) => setCorrectionComment(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500 bg-white"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleProductionApproval(false)}
                    disabled={updating}
                    className="py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 text-rose-700 text-xs font-bold transition-all active:scale-95 cursor-pointer text-center"
                  >
                    Pedir Corrección
                  </button>
                  <button
                    onClick={() => handleProductionApproval(true)}
                    disabled={updating}
                    className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} className="stroke-[2.5]" />
                    Dar Visto Bueno
                  </button>
                </div>
              </div>
            );
          })()}
        </section>

        {/* Actions Transition Panel */}
        {nextActions.length > 0 && user?.rol !== 'pastelero' && (
          <section className="bg-white rounded-3xl border border-slate-100 p-5 shadow-premium space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Actualizar Estado</h4>
            
            {nextActions.map(action => {
              const isTransitionDisabled = action.status === 'en_sede' && getProductionStatus().status !== 'aprobado';
              return (
                <button
                  key={action.status}
                  onClick={() => handleStatusChange(action.status)}
                  disabled={updating || isTransitionDisabled}
                  className={`w-full py-4 rounded-2xl text-xs font-black shadow-lg shadow-amber-500/10 transition-all active:scale-98 ${action.classes} ${isTransitionDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  title={isTransitionDisabled ? 'Requiere Visto Bueno de producción' : ''}
                >
                  {action.label} {isTransitionDisabled ? '(Falta V°B°)' : ''}
                </button>
              );
            })}
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

      <OrderForm 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={order}
      />
    </div>
  );
};

```

---

<a id="srcpagesadminpaneljsx"></a>
### 📄 `src/pages/AdminPanel.jsx` (406 líneas)

```jsx
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
const ROLES = ['vendedor', 'admin', 'pastelero'];

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
                        <option key={r} value={r}>Rol: {r === 'admin' ? 'Admin' : r === 'pastelero' ? 'Pastelero' : 'Vendedor'}</option>
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

```

---

