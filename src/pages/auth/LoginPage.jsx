import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Store, Lock, User, AlertCircle, Shield, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(username, password);
      if (res.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (res.role === 'ROLE_MANAGER') {
        navigate('/manager/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justify: 'center',
        background: 'linear-gradient(135deg, #f0f6ff 0%, #dbeafe 100%)',
        padding: '24px 16px',
        margin: 0,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          margin: '0 auto',
        }}
        className="glass-card"
      >
        <div style={{ padding: '36px 32px 24px 32px', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)',
            }}
          >
            <Store size={34} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.7rem', fontFamily: 'var(--font-statement)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            ANNAAM <span style={{ color: '#2563eb' }}>CHAIN</span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-statement)', fontWeight: 800, letterSpacing: '0.06em' }}>
            INTERNAL STORE MANAGEMENT SYSTEM
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          {error && (
            <div
              style={{
                background: 'var(--status-danger-bg)',
                border: '1px solid var(--status-danger-border)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--status-danger)',
                fontSize: '0.825rem',
                fontWeight: 600,
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }} disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick Demo Access Helpers */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-statement)',
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: '12px',
                textAlign: 'center',
                letterSpacing: '0.05em',
              }}
            >
              Quick Demo Login Access
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fillDemo('admin', 'admin123')}
                style={{ fontSize: '0.775rem', justifyContent: 'center' }}
              >
                <Shield size={15} color="#2563eb" />
                <span>Central Admin</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fillDemo('manager_s001', 'manager123')}
                style={{ fontSize: '0.775rem', justifyContent: 'center' }}
              >
                <UserCheck size={15} color="#059669" />
                <span>Manager S001</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
