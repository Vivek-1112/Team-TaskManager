import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const nav = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try { await signup(form.name, form.email, form.password, form.role); nav('/dashboard'); }
    catch (err) { setError(err.response?.data?.error || 'Signup failed'); }
  };
  const s = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' },
    card: { background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
    input: { width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }
  };
  return (
    <div style={s.container}>
      <div style={s.card}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1e293b' }}>Sign Up</h2>
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={s.input} placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input style={s.input} type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input style={s.input} type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <select style={s.input} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button style={s.btn} type="submit">Sign Up</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#64748b' }}>Have account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};
export default Signup;
