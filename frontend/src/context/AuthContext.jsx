import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

const getCookie = (name) => {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = getCookie('token');
    const storedTenantId = getCookie('tenantId');
    const storedRole = getCookie('role');
    const storedUser = getCookie('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setTenantId(storedTenantId);
      setRole(storedRole);
    }
  }, []);

  const login = (userData, token, userTenantId, userRole) => {
    setCookie('token', token);
    setCookie('tenantId', userTenantId);
    setCookie('tenantSlug', userData.slug || userTenantId);
    setCookie('role', userRole);
    setCookie('user', JSON.stringify(userData));
    setUser(userData);
    setTenantId(userTenantId);
    setRole(userRole);
  };

  const logout = () => {
    deleteCookie('token');
    deleteCookie('tenantId');
    deleteCookie('tenantSlug');
    deleteCookie('role');
    deleteCookie('user');
    setUser(null);
    setTenantId(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, tenantId, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
