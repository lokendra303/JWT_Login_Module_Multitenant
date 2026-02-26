import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getCookie = (name) => {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
};

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = getCookie('token');
  const tenantSlug = getCookie('tenantSlug');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (tenantSlug) config.headers['x-tenant-slug'] = tenantSlug;
  return config;
});

export const tenantRegister = (data) => api.post('/tenant/register', data);
export const tenantLogin = (data) => api.post('/tenant/login', data);
export const updateTenantProfile = (data) => api.put('/tenant/profile', data);
export const userRegister = (data) => {
  const tenantSlug = getCookie('tenantSlug');
  return api.post('/tenant/users', data, {
    headers: { 'x-tenant-slug': tenantSlug }
  });
};
export const updateUser = (id, data) => api.put(`/tenant/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/tenant/users/${id}`);
export const userLogin = (data) => api.post('/login', data);
export const getAllUsers = () => api.get('/tenant/users');
export const getProtected = () => api.get('/protected');

export default api;
