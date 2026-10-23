import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('unt_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('unt_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token and user exist on mount
    const savedToken = localStorage.getItem('unt_token');
    const savedUser = localStorage.getItem('unt_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await axiosClient.post('/auth/login', {
      usuario: username,
      username: username,
      password,
    });
    const { token: jwtToken, rol, dni, nombres, apellidos } = res.data;
    
    const userData = {
      usuario: username,
      rol,
      dni,
      nombres,
      apellidos,
    };

    localStorage.setItem('unt_token', jwtToken);
    localStorage.setItem('unt_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const loginDocente = async (dni, docenteData, password) => {
    try {
      // 1. Intentar acceso directo de docente verificado (CU-05)
      const res = await axiosClient.post('/auth/login-docente', { dni });
      const { token: jwtToken, rol, nombres, apellidos } = res.data;

      const userData = {
        usuario: dni,
        rol: rol || 'ROLE_DOCENTE',
        dni,
        nombres: nombres || docenteData?.nombres,
        apellidos: apellidos || docenteData?.apellidos,
        facultad: docenteData?.facultad,
        escuela: docenteData?.escuela,
        condicion: docenteData?.condicion,
        categoria: docenteData?.categoria,
        nivelRenacyt: docenteData?.nivelRenacyt,
      };

      localStorage.setItem('unt_token', jwtToken);
      localStorage.setItem('unt_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return userData;
    } catch {
      // 2. Fallback a login estándar con contraseña por defecto
      const pass = password || dni;
      const res = await axiosClient.post('/auth/login', {
        usuario: dni,
        username: dni,
        password: pass,
      });
      const { token: jwtToken, rol } = res.data;

      const userData = {
        usuario: dni,
        rol: rol || 'ROLE_DOCENTE',
        dni,
        nombres: docenteData?.nombres || res.data.nombres,
        apellidos: docenteData?.apellidos || res.data.apellidos,
        facultad: docenteData?.facultad,
        escuela: docenteData?.escuela,
        condicion: docenteData?.condicion,
        categoria: docenteData?.categoria,
        nivelRenacyt: docenteData?.nivelRenacyt,
      };

      localStorage.setItem('unt_token', jwtToken);
      localStorage.setItem('unt_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return userData;
    }
  };

  const logout = () => {
    localStorage.removeItem('unt_token');
    localStorage.removeItem('unt_user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.some(r => user.rol === r || user.rol === `ROLE_${r}`);
    }
    return user.rol === role || user.rol === `ROLE_${role}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        loginDocente,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
