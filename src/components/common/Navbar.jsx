import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Store, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isManager } = useAuth();

  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        zIndex: 100,
        boxShadow: 'var(--shadow-subtle)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
          }}
        >
          <Store size={24} color="#ffffff" />
        </div>
        <div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontFamily: 'var(--font-statement)',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.02em',
            }}
          >
            ANNAAM <span style={{ color: '#2563eb' }}>CHAIN</span>
          </h2>
          <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
            STORE MANAGEMENT PORTAL
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {isManager && user?.assignedStoreName && (
          <div className="badge badge-info" style={{ padding: '7px 16px', fontSize: '0.825rem' }}>
            <Store size={15} />
            <span>{user.assignedStoreCode} — {user.assignedStoreName}</span>
          </div>
        )}

        {isAdmin && (
          <div className="badge badge-info" style={{ padding: '7px 16px', fontSize: '0.825rem', background: '#eff6ff', color: '#2563eb' }}>
            <ShieldCheck size={15} />
            <span>CENTRAL APPLICATION ADMIN</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1.5px solid var(--border-color)', paddingLeft: '20px' }}>
          <div
            style={{
              background: '#f1f5f9',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              border: '1px solid var(--border-color)',
            }}
          >
            <UserIcon size={20} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-statement)' }}>
              {user?.fullName}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{user?.username}</div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: '12px' }}
            title="Sign Out"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
