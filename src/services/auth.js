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
    password: 'SD123',
    sede: 'SD',
    rol: 'vendedor'
  },
  {
    uid: 'vendedor-florencia-uid',
    usuario: 'Vendedor Florencia',
    email: 'fm@unoconaroma.com',
    password: 'Fm123',
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
    password: 'PV123',
    sede: 'Porvenir',
    rol: 'vendedor'
  },
  {
    uid: 'vendedor-quintanas-uid',
    usuario: 'Vendedor Las Quintanas',
    email: 'quintanas@unoconaroma.com',
    password: 'QT123',
    sede: 'Las Quintanas',
    rol: 'vendedor'
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

  return { uid: data.user.id, email: data.user.email, ...profile };
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
  const { error: insertError } = await supabase
    .from('usuarios')
    .insert([{ uid, usuario, email, sede, rol }]);

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
        callback({ uid: session.user.id, email: session.user.email, ...profile });
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
