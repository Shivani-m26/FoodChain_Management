import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Store,
  Package,
  Truck,
  TrendingUp,
  BarChart3,
  DollarSign,
  ClipboardList,
  Users,
  Boxes,
  FileCheck2,
  Receipt,
  UserCheck
} from 'lucide-react';

const Sidebar = () => {
  const { isAdmin, user } = useAuth();

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/stores', icon: Store, label: 'Stores Fleet' },
    { to: '/admin/workforce', icon: Users, label: 'Workforce & Staffing' },
    { to: '/admin/materials', icon: Package, label: 'Raw Materials' },
    { to: '/admin/distribution', icon: Truck, label: 'Distribution' },
    { to: '/admin/sales', icon: TrendingUp, label: 'Sales Analysis' },
    { to: '/admin/profit', icon: BarChart3, label: 'Profit Analysis' },
    { to: '/admin/budgets', icon: DollarSign, label: 'Budgets & Expenses' },
    { to: '/admin/audit-logs', icon: ClipboardList, label: 'Audit Logs' },
    { to: '/admin/users', icon: Users, label: 'User Accounts' },
  ];

  const managerLinks = [
    { to: '/manager/dashboard', icon: LayoutDashboard, label: 'Store Dashboard' },
    { to: '/manager/workforce', icon: UserCheck, label: 'Staff Attendance Log' },
    { to: '/manager/inventory', icon: Boxes, label: 'Daily Material Update' },
    { to: '/manager/change-requests', icon: FileCheck2, label: 'Change & Closure Requests' },
    { to: '/manager/sales', icon: Receipt, label: 'Daily Sales Entry' },
    { to: '/manager/analysis', icon: BarChart3, label: 'Store Performance' },
  ];

  const links = isAdmin ? adminLinks : managerLinks;

  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        background: '#ffffff',
        borderRight: '1px solid var(--border-color)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        minHeight: 'calc(100vh - 71px)',
        boxShadow: 'var(--shadow-subtle)',
      }}
    >
      <div
        style={{
          padding: '0 12px 14px 12px',
          fontSize: '0.725rem',
          fontFamily: 'var(--font-statement)',
          fontWeight: 900,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {isAdmin ? 'CENTRAL NAVIGATION' : `BRANCH ${user?.assignedStoreCode || ''}`}
      </div>

      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-statement)',
              fontWeight: isActive ? 800 : 600,
              color: isActive ? '#2563eb' : 'var(--text-secondary)',
              background: isActive ? '#eff6ff' : 'transparent',
              border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
            })}
          >
            <Icon size={19} color={undefined} />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </aside>
  );
};

export default Sidebar;
