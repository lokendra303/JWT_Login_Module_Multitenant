import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tenantLogin, userLogin } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Try tenant login first (silently)
      try {
        const { data } = await tenantLogin(formData);
        login(data.tenant, data.token, data.tenant.id, 'tenant');
        navigate('/dashboard');
        return;
      } catch (tenantErr) {
        // Silently fail and try user login
      }
      
      // Try user login
      const { data } = await userLogin(formData);
      login(data.user, data.token, data.user.tenant_id, data.user.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
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
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={styles.input}
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              {showPassword ? '👁️' : '👁️🗨️'}
            </button>
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <p style={styles.link}>
          Tenant? <Link to="/tenant/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5', padding: '20px' },
  card: { background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  title: { textAlign: 'center', marginBottom: '30px', color: '#333' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  passwordContainer: { position: 'relative' },
  input: { padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', width: '100%' },
  eyeBtn: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' },
  button: { padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
  error: { color: 'red', fontSize: '14px', margin: 0 },
  link: { textAlign: 'center', marginTop: '15px', fontSize: '14px' }
};

export default Login;
