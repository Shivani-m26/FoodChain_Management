import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UnauthorizedPage = () => {
  const { isAdmin } = useAuth();

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-card" style={{ maxWidth: '480px', padding: '40px', textAlign: 'center' }}>
        <div style={{ background: 'var(--status-danger-bg)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <ShieldAlert size={36} color="var(--status-danger)" />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px' }}>403 Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
          You do not have administrative permissions to view this store or access central configurations.
        </p>
        <Link to={isAdmin ? '/admin/dashboard' : '/manager/dashboard'} className="btn btn-primary">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
