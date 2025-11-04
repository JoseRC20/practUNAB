import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const LS_KEY = 'auth';        // guardaremos { user, token } aquí
const LS_KEY_LEGACY = 'authToken'; // compatibilidad con tu clave actual

function parseAuth(raw) {
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    const { user, token } = data;
    if (!token) return null;
    // user puede venir vacío en tu versión actual; lo permitimos pero normalizamos
    return { user: user && typeof user === 'object' ? user : null, token };
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehidratación (con migración desde 'authToken' si existía)
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    let parsed = raw ? parseAuth(raw) : null;

    // Migración: si no hay 'auth' pero sí 'authToken', lo convertimos a auth mínimo
    if (!parsed) {
      const legacy = localStorage.getItem(LS_KEY_LEGACY);
      if (legacy) {
        const legacyAuth = { user: null, token: legacy };
        localStorage.setItem(LS_KEY, JSON.stringify(legacyAuth));
        localStorage.removeItem(LS_KEY_LEGACY);
        parsed = legacyAuth;
      }
    }

    if (parsed) {
      setUser(parsed.user);
      setToken(parsed.token);
    }
    setLoading(false);
  }, []);

  // Inicia sesión guardando { user, token }
  const login = ({ user: u, token: t }) => {
    const next = { user: u ?? null, token: t };
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    setUser(next.user);
    setToken(next.token);
  };

  // Actualiza SOLO algunos campos del user (merge inmutable + persistencia)
  const patchUser = (partial) => {
    setUser(prev => {
      const prevUser = prev ?? {};
      const nextUser = { ...prevUser, ...partial };
      const current = parseAuth(localStorage.getItem(LS_KEY) || '') || { token };
      const nextAuth = { user: nextUser, token: current.token };
      localStorage.setItem(LS_KEY, JSON.stringify(nextAuth));
      return nextUser;
    });
  };

  // Limpia sesión
  const logout = () => {
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LS_KEY_LEGACY); // por si acaso
    setUser(null);
    setToken(null);
  };

  // (Opcional) API mínima compatible con tu versión anterior
  const saveToken = (newToken) => login({ user: user ?? null, token: newToken });
  const clearToken = logout;

  const value = useMemo(() => ({
    user, token,
    login, logout,
    patchUser,
    // compat legado:
    saveToken, clearToken,
  }), [user, token]);

  if (loading) return null; // o un loader
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
