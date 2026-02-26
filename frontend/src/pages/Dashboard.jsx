import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getAllUsers, userRegister, updateUser, deleteUser, updateTenantProfile } from '../services/api';

const Dashboard = () => {
  const { user, role, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user', mobile: '' });
  const [profileData, setProfileData] = useState({ name: '', email: '', mobile: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
    if (role === 'tenant') fetchUsers();
  }, [user, role, navigate]);

  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsers();
      console.log('Users data:', data);
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
      } else {
        await userRegister(formData);
      }
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'user', mobile: '' });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleEditUser = (u) => {
    setEditingUser(u);
    setFormData({ name: u.name, email: u.email, mobile: u.mobile || '', password: '', role: u.role || 'user' });
    setShowModal(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await updateTenantProfile(profileData);
      setShowProfileModal(false);
      setProfileData({ name: '', email: '', mobile: '', password: '' });
      alert('Profile updated successfully. Please login again.');
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {role === 'tenant' && <button onClick={() => setShowProfileModal(true)} style={styles.profileBtn}>Edit Profile</button>}
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>
      
      <div style={styles.userInfo}>
        <h3>Welcome, {user?.name || user?.email}</h3>
        <p>Role: {role}</p>
        {user?.tenant_name && <p>Tenant: {user.tenant_name}</p>}
      </div>

      {role === 'tenant' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2>User Management</h2>
            <button onClick={() => setShowModal(true)} style={styles.addBtn}>+ Add User</button>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={styles.td}>{u.name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.role}</td>
                  <td style={styles.td}>
                    <button onClick={() => handleEditUser(u)} style={styles.editBtn}>Edit</button>
                    <button onClick={() => handleDeleteUser(u.id)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
            <form onSubmit={handleCreateUser} style={styles.form}>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={styles.input}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={styles.input}
                required
              />
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={editingUser ? 'Password (leave empty to keep current)' : 'Password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={styles.input}
                  required={!editingUser}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  {showPassword ? '👁️' : '👁️🗨️'}
                </button>
              </div>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={styles.input}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {error && <p style={styles.error}>{error}</p>}
              <div style={styles.modalActions}>
                <button type="submit" style={styles.submitBtn}>{editingUser ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => { setShowModal(false); setEditingUser(null); setFormData({ name: '', email: '', password: '', role: 'user', mobile: '' }); }} style={styles.cancelBtn}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Edit Profile</h2>
            <form onSubmit={handleUpdateProfile} style={styles.form}>
              <input
                type="text"
                placeholder="Company Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                style={styles.input}
              />
              <input
                type="email"
                placeholder="Email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                style={styles.input}
              />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={profileData.mobile}
                onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                style={styles.input}
              />
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New Password (leave empty to keep current)"
                  value={profileData.password}
                  onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                  style={styles.input}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  {showPassword ? '👁️' : '👁️🗨️'}
                </button>
              </div>
              {error && <p style={styles.error}>{error}</p>}
              <div style={styles.modalActions}>
                <button type="submit" style={styles.submitBtn}>Update</button>
                <button type="button" onClick={() => { setShowProfileModal(false); setProfileData({ name: '', email: '', mobile: '', password: '' }); }} style={styles.cancelBtn}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' },
  profileBtn: { padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  logoutBtn: { padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  userInfo: { background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  section: { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflowX: 'auto' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  addBtn: { padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  editBtn: { padding: '6px 12px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', marginRight: '5px' },
  deleteBtn: { padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '500px' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd', background: '#f8f9fa' },
  td: { padding: '12px', borderBottom: '1px solid #ddd' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 1000 },
  modalContent: { background: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
  passwordContainer: { position: 'relative' },
  input: { padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', width: '100%' },
  eyeBtn: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' },
  modalActions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  submitBtn: { flex: 1, padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', minWidth: '120px' },
  cancelBtn: { flex: 1, padding: '12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', minWidth: '120px' },
  error: { color: 'red', fontSize: '14px', margin: 0 }
};

export default Dashboard;
